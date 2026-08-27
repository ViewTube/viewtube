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
export class ShakaSabrPlayerAdapter implements SabrPlayerAdapter {
  private player: shaka.Player | null = null;
  private requestMetadataManager?: RequestMetadataManager;
  private cacheManager?: CacheManager;
  private abortController?: AbortController;
  private requestFilter?: shaka.extern.RequestFilter;
  private responseFilter?: shaka.extern.ResponseFilter;

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

  getActiveTrackFormats(
    activeFormat: SabrFormat,
    sabrFormats: SabrFormat[]
  ): { videoFormat?: SabrFormat; audioFormat?: SabrFormat } {
    const player = this.requirePlayer();

    const activeId = FormatKeyUtils.getUniqueFormatId(activeFormat);
    const activeVariant = player
      .getVariantTracks()
      .find(
        track => activeId === (activeFormat.width ? track.originalVideoId : track.originalAudioId)
      );

    if (!activeVariant) return {};

    const formatsById = new Map(
      sabrFormats.map(format => [FormatKeyUtils.getUniqueFormatId(format), format])
    );

    return {
      videoFormat: activeVariant.originalVideoId
        ? formatsById.get(activeVariant.originalVideoId)
        : undefined,
      audioFormat: activeVariant.originalAudioId
        ? formatsById.get(activeVariant.originalAudioId)
        : undefined
    };
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

      const response = await fetch(uri, init);
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

    // A response carrying only a redirect or a context update has no media in it; the
    // streaming adapter reacts to that and reissues the request.
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
      throw recoverableError('Empty SABR response with no redirect information', requestMetadata);
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
        throw recoverableError('Empty SABR response with no redirect information', requestMetadata);
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

    throw recoverableError('UMP stream aborted before producing a segment', requestMetadata);
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
