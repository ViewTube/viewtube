# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

ViewTube is a privacy-friendly YouTube frontend: a Nuxt 4 client and a NestJS server in one pnpm
workspace, shipped as a single Docker image where Nest serves the built Nuxt app.

See [TODO.md](TODO.md) for known loose ends, and read it before "fixing" something that looks wrong:
the project began in 2019 as an invidio.us frontend and grew its own scraping layer around 2023, so
pre-2023 code (notably `core/proxy` and the tsconfig strictness flags) assumes a trusted upstream and
should be read as legacy to correct rather than as a pattern to imitate.

## Commands

Node >= 26.7 and pnpm >= 11.23 are required (`packageManager` pins pnpm 11.23.0).

```bash
pnpm install            # postinstall runs build:shared + build:metadata + nuxt:prepare (skipped when CI=true)
pnpm serve:env          # MongoDB (27017) + Redis (6379) via docker-compose.dev.yml — start this first
pnpm serve:server       # nest start -w, port 8067 (from server/.env)
pnpm serve:client       # nuxi dev, port 8066, proxies /api -> localhost:8067
```

Open http://localhost:8066 during development. The client is the entry point in dev; in production
the server serves everything on one port.

```bash
pnpm build              # all workspaces
pnpm build:shared       # must run before typechecking client/server after touching shared/
pnpm lint / lint:fix    # eslint (needs client/.nuxt present — run pnpm nuxt:prepare first)
pnpm format             # prettier
pnpm knip               # unused-export check (server + shared only; client is ignored)
```

### Tests

There are no unit tests — Cypress e2e only, run against a full Docker stack on port 8466.

```bash
pnpm e2e                                    # build+start environment, then cypress run
pnpm --filter=./tests run environment:prepare   # docker stack only
pnpm --filter=./tests run cy:open               # interactive
pnpm --filter=./tests exec cypress run --spec cypress/e2e/3-pages/watch.cy.ts   # single spec
pnpm --filter=./tests run environment:teardown
```

Specs target `http://localhost:8466` via `tests/cypress/support/constants.ts`. Because they hit
live YouTube, failures are frequently caused by YouTube-side changes rather than by local edits —
compare against a baseline run before treating a red spec as a regression.

### Regenerating the API contract

`shared/src/api.schema.ts` and `server/src/metadata.ts` are generated but **committed**. After
adding or changing any server DTO, regenerate so the client sees the new types:

```bash
pnpm --filter=./server run gen:api   # builds server, emits swagger, writes shared/src/api.schema.ts
```

`metadata.ts` is emitted by the `@nestjs/swagger` CLI plugin on `nest build`. Never hand-edit either
file.

**Stop `pnpm serve:server` before building or regenerating.** `nest start -w` rewrites
`src/metadata.ts` on every edit and keeps entries for DTOs that have been deleted or renamed, so the
file fills up with imports of files that no longer exist. The build then fails on those dangling
imports — and because `metadata.ts` is written after the type-check stage, the build that would have
repaired it dies first. `tsc` blames `src/metadata.ts` with `TS2307` while your own sources are
clean; that combination means a watcher is running.

Recovery: stop the dev server, replace `src/metadata.ts` with
`export default async () => ({ "@nestjs/swagger": { "models": [], "controllers": [] } })`, run
`gen:api`, restart the dev server.

## Architecture

### Workspaces

- `server/` — NestJS 11 on Fastify. Scrapes YouTube, owns MongoDB/Redis, serves the client.
- `client/` — Nuxt 4 (`client/app/` source root), Pinia, UnoCSS, SCSS.
- `shared/` — tiny Vite-built lib: the generated OpenAPI schema plus a few utils. Consumed as
  `@viewtube/shared`; `ApiDto<'SomeDto'>` is the canonical way for the client to type API responses.
- `tests/` — Cypress e2e.

### One process, two frameworks

`server/src/main.ts` boots Nest, then in production imports the compiled Nuxt server bundle
(`client/.output/server/index.mjs`) through `NuxtModule`/`NuxtService`, which forwards every
non-`/api` request to Nuxt's listener and serves `_nuxt` static assets directly with long cache
headers. `RouterModule.register` in `app.module.ts` prefixes all Nest feature modules with `api`,
so `/api/*` is Nest and everything else is Nuxt.

During SSR the client does **not** make an HTTP round trip: `useVtFetch`
(`client/app/composables/vtFetch.ts`) detects `global.nestApp` and calls `nestApp.inject()` in
process, forwarding auth cookies manually and replaying `set-cookie` onto the SSR response. On the
client it falls through to `ofetch`. `useApiUrl` returns `/api/` except during dev SSR, where it
returns `http://localhost:${API_DEV_PORT}/api/`. Anything that must always be a real browser
request uses `vtClientFetch` (`client/app/utils/vtClientFetch.ts`).

### Server layout

- `core/` — the YouTube-facing features: `videos`, `channels`, `search`, `comments`, `playlists`,
  `homepage`, `autocomplete`, plus two passthroughs: `proxy` (images) and `videoplayback`
  (stream proxy, `@BypassAuth()`).
- `common/innertube/` — the single shared `youtubei.js` `Innertube` client, recreated every 10
  minutes, with po_token/visitor_data/cookie overridable by env.
- `common/vtFetch.ts` + `common/proxyAgent.ts` — undici-based fetch used for all outbound YouTube
  traffic, optionally through a SOCKS/HTTP proxy.
- `mapper/` — **the layer that absorbs YouTube instability.** Raw `youtubei.js` nodes are turned
  into stable `VT*Dto` shapes by `converter/<kind>/*.converter.ts`, which delegate every field to a
  small `*.extractors.ts` function, typed against a permissive `*SourceApproximation` type. When
  YouTube changes a renderer, fix the extractor — not the callers.
- `auth/` — JWT access token (10 min) + DB-backed refresh token (7 days), both in cookies.
  `PublicAuthGuard` runs globally and silently upgrades a request to authenticated when only the
  refresh token is valid; route behavior is selected with the `@Public()`, `@Private()` and
  `@BypassAuth()` decorators. See `server/src/auth/SESSION.md`.
- `user/` — accounts, `settings`, `history`, `subscriptions` (a scheduled task polls subscribed
  channels), `notifications` (web-push).
- `admin/` — server settings (registration toggle, require-login-everywhere) read at boot in
  `main.ts` and pushed into `NUXT_PUBLIC_*` env vars, plus blocked videos and log access.
- `common/potoken/` — **a ViewTube instance runs YouTube's BotGuard attestation.** A worker
  thread (`potoken.worker.ts`) mints PO tokens; `PoTokenService` owns its lifecycle, rotates
  at 80% of the ~12h token TTL, and hands out a session token (bound to `visitorData`, used
  to build the Innertube client) and per-video content tokens (used on the player request
  and in the SABR block). The **worker thread is a correctness requirement, not an
  optimisation**: BotGuard needs `globalThis.window`/`document`, and in production Nuxt's
  SSR bundle shares this process, so setting them on the main thread breaks server
  rendering. Everything is best-effort — a failed mint returns `null` and playback degrades
  to tokenless rather than throwing. `VIEWTUBE_POTOKEN_ENABLED=false` turns it off;
  `VIEWTUBE_PO_TOKEN` + `VIEWTUBE_VISITOR_DATA` pin a pair manually and skip generation.
- Config: Joi-validated env (`env.validation.ts`); JWT and VAPID keys are auto-generated and
  persisted to the data directory by `ConfigurationService` if not provided. Redis holds both the
  cache-manager cache and the Bull queues (db 1). `VIEWTUBE_CLUSTERED` enables `AppClusterService`.
- Path aliases inside `server/`: `server/*` -> `src/*`, `common/*` -> `src/common/*`.
- `strictNullChecks` and `strictFunctionTypes` are off in **both** `server/tsconfig.json` and
  `client/tsconfig.json` (despite `typescript.strict: true` in `nuxt.config.ts`), so the compiler
  will not catch null/undefined for you in either workspace.

### Client layout

Standard Nuxt auto-imports apply — `client/app/composables/` and `client/app/utils/` need no
imports. The split to know: `composables/api/*` are SSR-safe data-fetching composables (built on
`useVtFetch`), `utils/api/*` are plain client-side calls (built on `vtClientFetch`), mostly for
continuations and mutations.

The video player lives in `components/watch/`, with its state decomposed into single-concern
composables under `composables/videoplayer/` and interchangeable playback backends in
`utils/videoplayer/adapters/`, chosen in `videoSource.ts` from what the DTO carries rather than by
device support. **SABR (Shaka) is the VOD path** — YouTube stopped putting segment URLs in
`adaptive_formats`, so the server ships a `sabr` block and the client turns each segment into a
protobuf POST through `/api/videoplayback`. `dashAdapter` (rx-player) is the fallback when a video
has a plain manifest; `hlsAdapter` / `nativeAdapter` are live-only and currently unreachable,
because YouTube serves no live manifest to any client. See [SABR_PLAN.md](SABR_PLAN.md) — including
its attestation-gate section, which explains why some videos stop playing after about a minute and
why that is not a bug to fix in the adapter.

Cross-page state lives in Pinia stores in `app/store/`; several persist via
`pinia-plugin-persistedstate` cookies, which `useVtFetch` forwards on SSR requests.

SCSS variables and mixins from `app/assets/styles/global/` are injected into every `<style lang="scss">`
block, so use `variables.$x` / `mixins.y` without importing. UnoCSS provides icons only
(`@iconify-json/mdi`); icons referenced dynamically must be added to `app/utils/icons.ts`'s
`iconSafelist` or they get tree-shaken away.

Images and video streams always go through the server proxies — use `useImgProxy()` / `useProxyUrls()`
rather than embedding `googlevideo.com`/`ytimg.com` URLs directly.

### Adding an API endpoint

The steps span three workspaces, so the whole path in one place:

1. **DTO** — a plain exported class in the feature's `dto/` folder, e.g.
   `export class HomeFeedDto { videos: Array<VTVideoDto>; }`. No `@ApiProperty()` decorators: the
   `@nestjs/swagger` CLI plugin infers the schema from the TypeScript types, which is what
   `server/src/metadata.ts` records. An untyped or `any` return will silently produce a useless
   schema.
2. **Controller** — annotate with `@ApiTags(...)` and `@Controller('<feature>')`, and give the
   handler an explicit `Promise<SomeDto>` return type. Auth is opt-out, not opt-in:
   `PublicAuthGuard` runs globally, so reach for `@Public()`, `@Private()` or `@BypassAuth()`
   deliberately. Take `ViewTubeRequest` (not `FastifyRequest`) when you need `request.user`, and
   `@Res({ passthrough: true })` when you only want to set headers.
3. **Register** — a new module must be added to _both_ `imports` and the `prefixApi([...])` list in
   `app.module.ts`, or it will not be reachable under `/api`.
4. **Regenerate** — `pnpm --filter=./server run gen:api`, then commit the changed
   `shared/src/api.schema.ts` and `server/src/metadata.ts`.
5. **Consume** — type the response as `ApiDto<'HomeFeedDto'>` and add a `useGet*` composable in
   `composables/api/` built on `useVtFetch` + `useApiUrl` (SSR-safe, wrapped in
   `useLazyAsyncData`), or a plain function in `utils/api/` built on `vtClientFetch` for
   client-only calls such as continuations and mutations.

## Conventions

- Commit subjects adhere to the [conventional commits specification](https://www.conventionalcommits.org/).
  In the past, commit emojis were used.
- PRs target `development`; tags `v*` build the stable image.
- `CHANGELOG.md` feeds the GitHub release job (`moisout/changelog-create-release`), but per-PR
  entries have lapsed — nothing since 0.17.0 (#2940), while `package.json` is already 0.17.1. Don't
  add an entry unprompted; follow the maintainer's lead.
- Prettier settings are non-default (see `.prettierrc.json`); the one with teeth is
  `prettier-plugin-organize-imports`, which owns import order — don't hand-sort imports.
