import {
  SabrUmpProcessor,
  type RequestFilter,
  type ResponseFilter,
  type SabrPlayerAdapter,
  type SabrRequestMetadata,
  type UmpProcessingResult
} from 'googlevideo/sabr-streaming-adapter';
import type { SabrFormat } from 'googlevideo/shared-types';
import {
  FormatKeyUtils,
  isGoogleVideoURL,
  type CacheManager,
  type RequestMetadataManager
} from 'googlevideo/utils';
import shaka from 'shaka-player/dist/shaka-player.compiled';
import { rewriteSabrHost } from '../proxy';

/**
 * Bridges Shaka Player to googlevideo's SABR machinery.
 *
 * Adapted from the reference implementation in LuanRT/googlevideo
 * (examples/sabr-shaka-example). The notable divergence: ViewTube proxies playback
 * server-side through `/api/videoplayback`, so the reference's browser-extension proxy
 * hooks are dropped and plain `fetch` is always used.
 *
 * Rather than filtering requests, this registers itself as Shaka's http/https scheme
 * handler. SABR responses arrive as a UMP stream that has to be decoded into plain media
 * bytes before Shaka ever sees them, and owning the scheme is what makes streaming,
 * progress reporting and segment caching possible while doing that.
 */
/**
 * Marker for a SABR response that is well-formed but carries no media, on a stream YouTube
 * has not flagged for attestation. That is the server declining to serve further ahead for
 * now and it recovers on its own, so `sabrAdapter` keeps it out of the UI while Shaka sees
 * a recoverable network error and retries. When the stream *is* flagged, the same shape of
 * response means something permanent instead — see `SABR_ATTESTATION_REQUIRED`.
 */
export const SABR_NO_MEDIA = 'SABR response carried no media';

/**
 * Marker for the one reason YouTube is known to stop serving media mid-video.
 *
 * `STREAM_PROTECTION_STATUS` is 1 for videos that play to the end and 2 from the very
 * first response for videos that stop after about a minute; once the grace period is up
 * the server answers with policies and no media, and reports 3 to a client that reads the
 * whole response. googlevideo's own node downloader hits the same second of the same
 * videos and calls it "attestation required", so this is YouTube declining the session,
 * not a defect in the request. A PO token does not currently lift it — see POTOKEN_PLAN.md.
 */
export const SABR_ATTESTATION_REQUIRED = 'YouTube requires attestation for this video';

/**
 * The id a representation carries in the manifest.
 *
 * youtubei.js names audio representations `itag[-audioTrackId][-drc][-vb]`, but
 * googlevideo's `getUniqueFormatId` stops at `-drc` — it has no notion of the `vb`
 * (voice-boost) variant YouTube now ships on some videos. On those, itag 140/249/250/251
 * each appear three times and Shaka asks for `140-vb`, which the googlevideo-keyed lookup
 * misses: the SABR request then goes out with no resolved audio format and YouTube answers
 * with directives and no media, forever.
 */
const manifestFormatId = (format: SabrFormat & { isVb?: boolean }): string => {
  const base = FormatKeyUtils.getUniqueFormatId(format);
  return !format.width && format.isVb ? `${base}-vb` : base;
};

export class ShakaSabrPlayerAdapter implements SabrPlayerAdapter {
  /**
   * @param proxyEndpoint - Absolute `/api/videoplayback` URL. Every SABR request is forced
   *   back through it: after a SABR redirect googlevideo stores the raw googlevideo edge
   *   URL and issues later requests straight to it, which the browser refuses on CORS.
   *   Whether a redirect happens at all depends on the edge YouTube hands out, so without
   *   this playback works on most videos and fails completely on the rest.
   */
  constructor(private readonly proxyEndpoint: string) {}

  private player: shaka.Player | null = null;
  private requestMetadataManager?: RequestMetadataManager;
  private cacheManager?: CacheManager;
  private abortController?: AbortController;
  private requestFilter?: shaka.extern.RequestFilter;
  private responseFilter?: shaka.extern.ResponseFilter;
  private lastActiveVariant?: shaka.extern.Track;

  initialize(
    player: shaka.Player,
    requestMetadataManager: RequestMetadataManager,
    cacheManager: CacheManager
  ): void {
    this.player = player;
    this.requestMetadataManager = requestMetadataManager;
    this.cacheManager = cacheManager;

    if (!shaka.net.HttpFetchPlugin.isSupported()) {
      throw new Error('SABR playback requires the Fetch API');
    }

    for (const scheme of ['http', 'https']) {
      shaka.net.NetworkingEngine.registerScheme(
        scheme,
        this.parseRequest.bind(this),
        shaka.net.NetworkingEngine.PluginPriority.PREFERRED
      );
    }
  }

  getPlayerTime(): number {
    return this.requirePlayer().getMediaElement()?.currentTime || 0;
  }

  getPlaybackRate(): number {
    return this.requirePlayer().getPlaybackRate();
  }

  getBandwidthEstimate(): number {
    return this.requirePlayer().getStats().estimatedBandwidth;
  }

  /**
   * The pair the server is told the player is using: the format actually being fetched,
   * plus whatever is playing on the other side.
   *
   * The requested format is used verbatim rather than looked up, because the lookup used
   * to go through `getVariantTracks()`, which hides variants Shaka has temporarily
   * disabled after a failed segment. Once one segment failed, the next request for that
   * format resolved to nothing, the server got an empty `preferredVideoFormatIds`, it
   * answered with directives and no media, and that failed too — each round disabling
   * another variant until the whole ladder was gone.
   */
  getActiveTrackFormats(
    activeFormat: SabrFormat,
    sabrFormats: SabrFormat[]
  ): { videoFormat?: SabrFormat; audioFormat?: SabrFormat } {
    const formatsById = new Map(sabrFormats.map(format => [manifestFormatId(format), format]));
    const active = this.activeVariant();

    // Reading the other side off the *active* variant, not off the first variant that
    // happens to pair with the requested one: variants are the cross product of the two
    // ladders, so the first match's partner is arbitrary. That made an audio request
    // announce the lowest video format and the concurrent video request announce the real
    // one, leaving the server's ABR with two contradictory views of one session.
    const otherSide = (id?: string | null) => (id ? formatsById.get(id) : undefined);

    return activeFormat.width
      ? { videoFormat: activeFormat, audioFormat: otherSide(active?.originalAudioId) }
      : { videoFormat: otherSide(active?.originalVideoId), audioFormat: activeFormat };
  }

  /**
   * Shaka reports no active variant while one is disabled or mid-switch, so the last known
   * one stands in — otherwise the pair above loses its other side exactly when playback is
   * already struggling.
   */
  private activeVariant(): shaka.extern.Track | undefined {
    const current = this.requirePlayer()
      .getVariantTracks()
      .find(track => track.active);

    if (current) this.lastActiveVariant = current;
    return current ?? this.lastActiveVariant;
  }

  registerRequestInterceptor(interceptor: RequestFilter): void {
    const networkingEngine = this.requirePlayer().getNetworkingEngine();
    if (!networkingEngine) return;

    this.requestFilter = async (type, request, context) => {
      if (type !== shaka.net.NetworkingEngine.RequestType.SEGMENT) return;
      if (!isGoogleVideoURL(request.uris[0])) return;

      const modified = await interceptor({
        url: request.uris[0],
        method: request.method,
        headers: request.headers,
        body: request.body,
        segment: {
          getStartTime: () => context?.segment?.getStartTime() ?? null,
          isInit: () => !context?.segment
        }
      });

      if (!modified) return;

      request.uris = modified.url ? [modified.url] : request.uris;
      request.method = modified.method || request.method;
      request.headers = modified.headers || request.headers;
      request.body = modified.body || request.body;

      // fetch() sends an ArrayBuffer body without a content type, which the proxy's
      // body parser rejects with a 415.
      if (request.method === 'POST' && request.body) {
        request.headers['content-type'] = 'application/x-protobuf';
      }
    };

    networkingEngine.registerRequestFilter(this.requestFilter);
  }

  registerResponseInterceptor(interceptor: ResponseFilter): void {
    const networkingEngine = this.requirePlayer().getNetworkingEngine();
    if (!networkingEngine) return;

    this.responseFilter = async (type, response, context) => {
      if (type !== shaka.net.NetworkingEngine.RequestType.SEGMENT) return;
      if (!isGoogleVideoURL(response.uri)) return;

      const modified = await interceptor({
        url: response.originalRequest.uris[0],
        method: response.originalRequest.method,
        headers: response.headers,
        data: response.data,
        // SABR answers the first request with a redirect to the host that actually
        // serves media; the adapter follows it through here.
        makeRequest: async (url: string, headers: Record<string, string>) => {
          const { retryParameters } = this.requirePlayer().getConfiguration().streaming;
          const followup = shaka.net.NetworkingEngine.makeRequest([url], retryParameters);
          Object.assign(followup.headers, headers);

          const followupResponse = await networkingEngine.request(type, followup, context).promise;

          return {
            url: followupResponse.uri,
            method: followupResponse.originalRequest.method,
            headers: followupResponse.headers,
            data: followupResponse.data
          };
        }
      });

      if (!modified) return;

      response.data = modified.data ?? response.data;
      Object.assign(response.headers, modified.headers);
    };

    networkingEngine.registerResponseFilter(this.responseFilter);
  }

  dispose(): void {
    this.abortController?.abort();
    this.abortController = undefined;
    this.lastActiveVariant = undefined;

    if (!this.player) return;

    const networkingEngine = this.player.getNetworkingEngine();
    if (networkingEngine && this.requestFilter && this.responseFilter) {
      networkingEngine.unregisterRequestFilter(this.requestFilter);
      networkingEngine.unregisterResponseFilter(this.responseFilter);
    }

    shaka.net.NetworkingEngine.unregisterScheme('http');
    shaka.net.NetworkingEngine.unregisterScheme('https');

    this.player = null;
  }

  /**
   * After a SABR redirect googlevideo stores the raw googlevideo edge URL and issues later
   * requests straight to it, which the browser refuses on CORS. Whether a redirect happens
   * at all depends on the edge YouTube hands out, so without this playback works on most
   * videos and fails outright on the rest.
   */
  private toProxied(url: string): string {
    if (!URL.canParse(url, window.location.origin)) return url;

    const target = new URL(url, window.location.origin);
    if (!target.hostname.endsWith('.googlevideo.com')) return url;

    return rewriteSabrHost(url, this.proxyEndpoint);
  }

  private requirePlayer(): shaka.Player {
    if (!this.player) throw new Error('SABR player adapter used before initialize()');
    return this.player;
  }

  private parseRequest(
    uri: string,
    request: shaka.extern.Request,
    requestType: shaka.net.NetworkingEngine.RequestType,
    progressUpdated: shaka.extern.ProgressUpdated,
    headersReceived: shaka.extern.HeadersReceived,
    config: shaka.extern.SchemePluginConfig
  ): shaka.extern.IAbortableOperation<shaka.extern.Response> {
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) headers.append(key, value);

    const controller = new AbortController();
    this.abortController = controller;

    const abortStatus = { canceled: false, timedOut: false };

    const pending = this.request(
      uri,
      request,
      requestType,
      {
        body: (request.body as BodyInit) || undefined,
        headers,
        method: request.method,
        signal: controller.signal,
        credentials: request.allowCrossSiteCredentials ? 'include' : undefined
      },
      controller,
      abortStatus,
      progressUpdated,
      headersReceived,
      config.minBytesForProgressEvents || 0
    );

    const operation = new shaka.util.AbortableOperation(pending, () => {
      abortStatus.canceled = true;
      controller.abort();
      return Promise.resolve();
    });

    const timeoutMs = request.retryParameters.timeout;
    if (timeoutMs) {
      const timer = new shaka.util.Timer(() => {
        abortStatus.timedOut = true;
        controller.abort();
      });
      timer.tickAfter(timeoutMs / 1000);
      operation.finally(() => timer.stop());
    }

    return operation;
  }

  private async request(
    uri: string,
    request: shaka.extern.Request,
    requestType: shaka.net.NetworkingEngine.RequestType,
    init: RequestInit,
    abortController: AbortController,
    abortStatus: { canceled: boolean; timedOut: boolean },
    progressUpdated: shaka.extern.ProgressUpdated,
    headersReceived: shaka.extern.HeadersReceived,
    minBytes: number
  ): Promise<shaka.extern.Response> {
    try {
      const requestMetadata = this.requestMetadataManager?.getRequestMetadata(uri);

      if (requestMetadata) {
        const cached = await this.readFromCache(
          requestMetadata,
          uri,
          request,
          requestType,
          progressUpdated,
          headersReceived
        );
        if (cached) return cached;
      }

      // Proxied here rather than by rewriting `request.uris`: the URI doubles as the key
      // for googlevideo's request metadata, so changing it upstream makes the lookup above
      // miss and the response gets treated as a non-SABR one.
      const response = await fetch(this.toProxied(uri), init);
      headersReceived(headersToObject(response.headers));

      // A rejected request still comes back as application/vnd.yt-ump with an empty body;
      // parsing it as a stream would report "empty response" instead of the real status.
      if (!response.ok) {
        return makeShakaResponse(
          headersToObject(response.headers),
          await response.arrayBuffer(),
          response.status,
          uri,
          response.url,
          request,
          requestType
        );
      }

      const isUmp =
        requestMetadata &&
        init.method !== 'HEAD' &&
        response.headers.get('content-type') === 'application/vnd.yt-ump';

      if (isUmp) {
        return await this.readUmpResponse(
          response,
          requestMetadata,
          uri,
          request,
          requestType,
          progressUpdated,
          abortController,
          minBytes
        );
      }

      const startedAt = Date.now();
      const arrayBuffer = await response.arrayBuffer();
      progressUpdated(Date.now() - startedAt, arrayBuffer.byteLength, 0);

      return makeShakaResponse(
        headersToObject(response.headers),
        arrayBuffer,
        response.status,
        uri,
        response.url,
        request,
        requestType
      );
    } catch (error) {
      if (abortStatus.canceled) {
        throw new shaka.util.Error(
          shaka.util.Error.Severity.RECOVERABLE,
          shaka.util.Error.Category.NETWORK,
          shaka.util.Error.Code.OPERATION_ABORTED,
          uri,
          requestType
        );
      }
      if (abortStatus.timedOut) {
        throw new shaka.util.Error(
          shaka.util.Error.Severity.RECOVERABLE,
          shaka.util.Error.Category.NETWORK,
          shaka.util.Error.Code.TIMEOUT,
          uri,
          requestType
        );
      }
      throw new shaka.util.Error(
        shaka.util.Error.Severity.RECOVERABLE,
        shaka.util.Error.Category.NETWORK,
        shaka.util.Error.Code.HTTP_ERROR,
        uri,
        error,
        requestType
      );
    }
  }

  private async readFromCache(
    requestMetadata: SabrRequestMetadata,
    uri: string,
    request: shaka.extern.Request,
    requestType: shaka.net.NetworkingEngine.RequestType,
    progressUpdated: shaka.extern.ProgressUpdated,
    headersReceived: shaka.extern.HeadersReceived
  ): Promise<shaka.extern.Response | null> {
    if (!requestMetadata.byteRange || !this.cacheManager) return null;

    const segmentKey = FormatKeyUtils.createSegmentCacheKeyFromMetadata(requestMetadata);
    const cached = requestMetadata.isInit
      ? this.cacheManager.getInitSegment(segmentKey)
      : this.cacheManager.getSegment(segmentKey);

    let buffer = cached?.buffer as ArrayBuffer | undefined;
    if (!buffer) return null;

    if (requestMetadata.isInit) {
      buffer = buffer.slice(requestMetadata.byteRange.start, requestMetadata.byteRange.end + 1);
    }

    const headers = {
      'content-type': requestMetadata.format?.mimeType?.split(';')[0] || '',
      'content-length': buffer.byteLength.toString(),
      'x-shaka-from-cache': 'true'
    };

    headersReceived(headers);
    progressUpdated(0, buffer.byteLength, 0);

    return makeShakaResponse(headers, buffer, 200, uri, uri, request, requestType);
  }

  private async readUmpResponse(
    response: Response,
    requestMetadata: SabrRequestMetadata,
    uri: string,
    request: shaka.extern.Request,
    requestType: shaka.net.NetworkingEngine.RequestType,
    progressUpdated: shaka.extern.ProgressUpdated,
    abortController: AbortController,
    minBytes: number
  ): Promise<shaka.extern.Response> {
    const processor = new SabrUmpProcessor(requestMetadata, this.cacheManager);
    let lastTime = Date.now();

    const assertUsable = (result: UmpProcessingResult) => {
      const failed =
        !!requestMetadata.error || requestMetadata.streamInfo?.streamProtectionStatus?.status === 3;
      if (!result.data && failed && !requestMetadata.streamInfo?.sabrContextUpdate) {
        throw recoverableError('SABR server streaming error', requestMetadata);
      }
    };

    /**
     * A response with no media in it is the server declining to serve. Reported as the
     * protection gate when it says so, because that is the difference the viewer can act
     * on: the rest of this video is not going to arrive, however long Shaka retries.
     */
    const noMediaError = () =>
      recoverableError(
        (requestMetadata.streamInfo?.streamProtectionStatus?.status ?? 1) > 1
          ? SABR_ATTESTATION_REQUIRED
          : SABR_NO_MEDIA,
        requestMetadata
      );

    // A response carrying only a redirect or a context update has no media in it; the
    // streaming adapter reacts to that and reissues the request.
    //
    // Deliberately NOT extended to `nextRequestPolicy`/`streamProtectionStatus`: handing
    // Shaka an empty body for those makes it fail parsing the segment as MP4 (error 3004),
    // which hides the real reason. Those come back as SABR_NO_MEDIA below instead.
    const isDirectiveOnly = () =>
      requestMetadata.isSABR &&
      (requestMetadata.streamInfo?.redirect || requestMetadata.streamInfo?.sabrContextUpdate);

    const finish = (data?: Uint8Array) =>
      makeShakaResponse(
        headersToObject(response.headers),
        (data as BufferSource) ?? new ArrayBuffer(0),
        response.status,
        uri,
        response.url,
        request,
        requestType
      );

    if (!response.body) {
      const arrayBuffer = await response.arrayBuffer();
      progressUpdated(Date.now() - lastTime, arrayBuffer.byteLength, 0);

      const result = await processor.processChunk(new Uint8Array(arrayBuffer));
      if (result) {
        assertUsable(result);
        return finish(result.data);
      }
      if (isDirectiveOnly()) return finish();
      throw noMediaError();
    }

    const reader = response.body.getReader();
    let loaded = 0;
    let lastLoaded = 0;
    let contentLength: string | undefined;

    while (!abortController.signal.aborted) {
      let chunk: ReadableStreamReadResult<Uint8Array>;
      try {
        chunk = await reader.read();
      } catch {
        break;
      }

      if (chunk.done) {
        if (isDirectiveOnly()) return finish();
        throw noMediaError();
      }

      const result = await processor.processChunk(chunk.value);
      const segmentInfo = processor.getSegmentInfo();

      if (segmentInfo) {
        contentLength ??= segmentInfo.mediaHeader.contentLength;
        loaded += segmentInfo.lastChunkSize || 0;
        segmentInfo.lastChunkSize = 0;
      }

      const now = Date.now();
      const chunkSize = loaded - lastLoaded;

      if ((now - lastTime > 100 && chunkSize >= minBytes) || result) {
        if (result) assertUsable(result);
        if (contentLength) {
          try {
            progressUpdated(
              now - lastTime,
              chunkSize,
              result ? 0 : parseInt(contentLength) - loaded
            );
          } catch {
            // Shaka throws if the operation was already torn down.
          } finally {
            lastLoaded = loaded;
            lastTime = now;
          }
        }
      }

      if (result) {
        abortController.abort();
        return finish(result.data);
      }
    }

    throw noMediaError();
  }
}

const headersToObject = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key.trim()] = value;
  });
  return result;
};

const recoverableError = (message: string, info?: Record<string, any>) =>
  new shaka.util.Error(
    shaka.util.Error.Severity.RECOVERABLE,
    shaka.util.Error.Category.NETWORK,
    shaka.util.Error.Code.HTTP_ERROR,
    message,
    { info }
  );

const makeShakaResponse = (
  headers: Record<string, string>,
  data: BufferSource,
  status: number,
  uri: string,
  responseUrl: string,
  request: shaka.extern.Request,
  requestType: shaka.net.NetworkingEngine.RequestType
): shaka.extern.Response => {
  if (status >= 200 && status <= 299 && status !== 202) {
    return {
      uri: responseUrl || uri,
      originalUri: uri,
      data,
      status,
      headers,
      originalRequest: request,
      fromCache: !!headers['x-shaka-from-cache']
    };
  }

  let responseText: string | null = null;
  try {
    responseText = shaka.util.StringUtils.fromBytesAutoDetect(data);
  } catch {
    // Body was not text; the status alone is enough to report.
  }

  throw new shaka.util.Error(
    status === 401 || status === 403
      ? shaka.util.Error.Severity.CRITICAL
      : shaka.util.Error.Severity.RECOVERABLE,
    shaka.util.Error.Category.NETWORK,
    shaka.util.Error.Code.BAD_HTTP_STATUS,
    uri,
    status,
    responseText,
    headers,
    requestType,
    responseUrl
  );
};
