import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import path from 'node:path';
import { Worker } from 'node:worker_threads';
import type { PoTokenSession, WorkerRequest, WorkerResponse } from './potoken.types';

/**
 * Owns the BotGuard worker and hands out PO tokens.
 *
 * Two kinds of token come out of one attestation: a **session** token bound to
 * `visitorData`, which the Innertube client is built with, and a **content** token bound to
 * a video id, used on that video's player request and in its SABR block. Attestation is the
 * expensive part (~200 ms plus a round trip); minting from the kept minter is ~1 ms, which
 * is why a token per video is affordable.
 *
 * Everything here is best-effort by design: a failure returns `null` rather than throwing,
 * so a broken minter degrades playback to what it was before tokens existed instead of
 * taking down search, channels and comments with it.
 *
 * Note this does **not** fix the attestation gate that stops some videos about a minute in
 * (`STREAM_PROTECTION_STATUS: 2` — see SABR_PLAN.md). Six token configurations were
 * measured against it, including tokens minted by a real browser with a matching
 * `visitorData`, and none moved it. This is hardening for the checks YouTube *does* apply
 * to tokens today, not a fix for that wall.
 */
@Injectable()
export class PoTokenService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('PoTokenService');

  private worker: Worker | null = null;
  private session: PoTokenSession | null = null;
  private attestation: Promise<PoTokenSession | null> | null = null;
  private rotationTimer: NodeJS.Timeout | null = null;
  private destroyed = false;
  private nextRequestId = 0;

  private readonly pendingMints = new Map<
    number,
    { resolve: (token: string | null) => void; timer: NodeJS.Timeout }
  >();

  /**
   * Incremented on every successful (re-)attestation. Callers that cache a token key the
   * cache by this, so a token from a minter that has since been replaced can never be
   * served against a session that no longer exists.
   */
  private generation = 0;

  getGeneration(): number {
    return this.generation;
  }

  onModuleInit(): void {
    if (process.env.VIEWTUBE_POTOKEN_ENABLED === 'false') {
      this.logger.log('PO token generation is disabled (VIEWTUBE_POTOKEN_ENABLED=false)');
      return;
    }

    if (this.manualSession()) {
      this.logger.log('Using the PO token from VIEWTUBE_PO_TOKEN / VIEWTUBE_VISITOR_DATA');
      return;
    }

    // Deliberately not awaited: attestation talks to Google, and a slow or failing round
    // trip must not hold up the rest of the server coming online.
    void this.ensureSession();
  }

  onModuleDestroy(): void {
    this.destroyed = true;
    if (this.rotationTimer) clearTimeout(this.rotationTimer);
    for (const pending of this.pendingMints.values()) {
      clearTimeout(pending.timer);
      pending.resolve(null);
    }
    this.pendingMints.clear();
    void this.worker?.terminate();
    this.worker = null;
  }

  /**
   * The `visitorData` + session-token pair the Innertube client is built from, or `null`
   * when attestation has not finished or is not available.
   */
  async getSession(): Promise<PoTokenSession | null> {
    const manual = this.manualSession();
    if (manual) return manual;
    if (process.env.VIEWTUBE_POTOKEN_ENABLED === 'false') return null;
    if (this.session) return this.session;

    return this.ensureSession();
  }

  /**
   * A token bound to one video id, for that video's player request and SABR block.
   *
   * Returns `null` rather than waiting indefinitely: a video request must not block on
   * attestation, and playback without a token is what happened before this existed.
   */
  async mintContentToken(videoId: string): Promise<string | null> {
    if (process.env.VIEWTUBE_POTOKEN_ENABLED === 'false') return null;

    // A manually pinned token is bound to whatever the operator generated it for, so it
    // cannot be re-bound per video; the session token stands in for both roles.
    const manual = this.manualSession();
    if (manual) return manual.poToken;

    if (!(await this.getSession())) return null;
    if (!this.worker) return null;

    return new Promise<string | null>(resolve => {
      const requestId = this.nextRequestId++;
      const timer = setTimeout(() => {
        this.pendingMints.delete(requestId);
        this.logger.warn(`Minting a content token for ${videoId} timed out`);
        resolve(null);
      }, 5000);

      this.pendingMints.set(requestId, { resolve, timer });
      this.send({ type: 'mint', requestId, binding: videoId });
    });
  }

  private manualSession(): PoTokenSession | null {
    const poToken = process.env.VIEWTUBE_PO_TOKEN;
    const visitorData = process.env.VIEWTUBE_VISITOR_DATA;
    return poToken && visitorData ? { poToken, visitorData } : null;
  }

  /**
   * Single-flighted: concurrent callers during startup or rotation await one attestation
   * rather than each spawning a worker and running BotGuard.
   */
  private ensureSession(): Promise<PoTokenSession | null> {
    if (this.attestation) return this.attestation;

    this.attestation = this.attest().finally(() => {
      this.attestation = null;
    });

    return this.attestation;
  }

  private async attest(): Promise<PoTokenSession | null> {
    if (this.destroyed) return null;

    const startedAt = Date.now();

    try {
      const worker = this.spawnWorker();
      const session = await this.runInit(worker);

      // Built before the old one is discarded, so a failed rotation leaves the working
      // session in place instead of causing an outage.
      void this.worker?.terminate();
      this.worker = worker;
      this.session = session.pair;
      this.generation += 1;

      this.logger.log(
        `Minted a PO token in ${Date.now() - startedAt}ms (generation ${this.generation}, ttl ${session.ttlSecs}s)`
      );

      this.scheduleRotation(session.ttlSecs);
      return this.session;
    } catch (error) {
      this.logger.warn(
        `PO token attestation failed, continuing without one: ${error instanceof Error ? error.message : error}`
      );
      // Not retried on a backoff here: `getSession()` re-attests on the next caller that
      // finds no session, which spaces retries by real demand rather than by a timer.
      return null;
    }
  }

  private spawnWorker(): Worker {
    // The SWC builder emits per-file JS, so the worker is a sibling of this file in `dist`.
    // `__dirname` rather than a path from the project root: the runtime image's layout is
    // not the repo's.
    const workerPath = path.join(__dirname, 'potoken.worker.js');
    const worker = new Worker(workerPath);

    worker.on('message', (message: WorkerResponse) => this.onWorkerMessage(message));
    worker.on('error', (error: Error) =>
      this.logger.warn(`PO token worker error: ${error.message}`)
    );
    worker.unref();

    return worker;
  }

  private runInit(
    worker: Worker
  ): Promise<{ pair: PoTokenSession; ttlSecs: number; mintRefreshThreshold: number }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        void worker.terminate();
        reject(new Error('attestation timed out'));
      }, 30000);

      const onMessage = (message: WorkerResponse) => {
        if (message.type === 'ready') {
          cleanup();
          resolve({
            pair: { poToken: message.poToken, visitorData: message.visitorData },
            ttlSecs: message.ttlSecs,
            mintRefreshThreshold: message.mintRefreshThreshold
          });
        } else if (message.type === 'error' && message.requestId === undefined) {
          cleanup();
          void worker.terminate();
          reject(new Error(message.message));
        }
      };

      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };

      const cleanup = () => {
        clearTimeout(timer);
        worker.off('message', onMessage);
        worker.off('error', onError);
      };

      worker.on('message', onMessage);
      worker.on('error', onError);
      worker.postMessage({ type: 'init' } satisfies WorkerRequest);
    });
  }

  private onWorkerMessage(message: WorkerResponse): void {
    if (message.type === 'ready') return;

    const requestId = message.requestId;
    if (requestId === undefined) {
      if (message.type === 'error') this.logger.warn(`PO token worker: ${message.message}`);
      return;
    }

    const pending = this.pendingMints.get(requestId);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingMints.delete(requestId);

    if (message.type === 'minted') {
      pending.resolve(message.token);
      return;
    }

    this.logger.warn(`Minting a PO token failed: ${message.message}`);
    pending.resolve(null);
    // A mint failing usually means the integrity token expired early; re-attest so the
    // next request is not answered by the same dead minter.
    void this.ensureSession();
  }

  /** Re-attest at 80% of the integrity token's life, well before it expires mid-playback. */
  private scheduleRotation(ttlSecs: number): void {
    if (this.rotationTimer) clearTimeout(this.rotationTimer);
    if (!ttlSecs || this.destroyed) return;

    this.rotationTimer = setTimeout(() => void this.ensureSession(), ttlSecs * 1000 * 0.8);
    this.rotationTimer.unref();
  }

  private send(message: WorkerRequest): void {
    this.worker?.postMessage(message);
  }
}
