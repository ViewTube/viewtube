/**
 * Shaka 4 ships its typings as ambient `declare namespace shaka`, not as a module, so a
 * direct import of the compiled bundle has no type. Bind the module's default export to
 * that global namespace.
 *
 * The version is pinned to 4.x deliberately: Shaka 5 resolves a request's scheme before
 * request filters run, which rejects the `sabr://` pseudo-URLs in YouTube's SABR
 * manifests with UNSUPPORTED_SCHEME before the SABR adapter can rewrite them.
 */
declare module 'shaka-player/dist/shaka-player.compiled' {
  const shakaPlayer: typeof shaka;
  export default shakaPlayer;
}
