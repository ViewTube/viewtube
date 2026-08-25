export class ProxyStreamQueryDto {
  /** Absolute url of the stream or manifest to proxy. Only YouTube-owned hosts are allowed. */
  url: string;
  /** Origin of this instance, used to rewrite the urls inside a proxied hls manifest. */
  originUrl: string;
}
