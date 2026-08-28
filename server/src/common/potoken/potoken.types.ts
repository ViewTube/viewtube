/** Messages exchanged with `potoken.worker.ts`. */

export type PoTokenSession = {
  poToken: string;
  visitorData: string;
};

export type WorkerRequest = { type: 'init' } | { type: 'mint'; requestId: number; binding: string };

export type WorkerResponse =
  | {
      type: 'ready';
      poToken: string;
      visitorData: string;
      ttlSecs: number;
      mintRefreshThreshold: number;
    }
  | { type: 'minted'; requestId: number; token: string }
  | { type: 'error'; requestId?: number; message: string };
