# Changelog

This file is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.15.1]

## Added

- Video share option to copy URL at timestamp (Thanks @alvanrahimli) [#2530](https://github.com/ViewTube/viewtube/pull/2530)

### Fixed

- Fix cannot read seconds of undefined [#2531](https://github.com/ViewTube/viewtube/pull/2531)
- Start video at timestamp in URL (Thanks @alvanrahimli) [#2530](https://github.com/ViewTube/viewtube/pull/2530)

## [0.15.0]

### Added

- Add option to disable registration to admin panel [#2499](https://github.com/ViewTube/viewtube/pull/2499)
- Add option to require login everywhere to admin panel [#2499](https://github.com/ViewTube/viewtube/pull/2499)
- Allow users to be added via the admin panel [#2499](https://github.com/ViewTube/viewtube/pull/2499)

### Fixed

- Use loadeddata event to fix video player aspect ratio (Thanks @themisir) [#2505](https://github.com/ViewTube/viewtube/pull/2505)
- Use value of apiUrl, fixes account deletion issue (Thanks @alvanrahimli) [#2515](https://github.com/ViewTube/viewtube/pull/2515)
- Fix logout not working [#2499](https://github.com/ViewTube/viewtube/pull/2499)

## [0.14.2]

### Fixed

- Remove miniplayer references causing issues [#2496](https://github.com/ViewTube/viewtube/pull/2496)

### Changed

- Disable arm/v7 build because of vite build issues https://github.com/vitejs/vite/issues/15167 [#2496](https://github.com/ViewTube/viewtube/pull/2496)

### Added

- Upgrade dependencies [#2496](https://github.com/ViewTube/viewtube/pull/2496)

## [0.14.1]

### Fixed

- Override rollup for arm64 builds [#2494](https://github.com/ViewTube/viewtube/pull/2494)

## [0.14.0]

### Breaking ⚠️

- Disable clustering by default [#2377](https://github.com/ViewTube/viewtube/pull/2377)
  - Clustering is now disabled by default. If you want to use clustering, you have to set the `VIEWTUBE_CLUSTERED` environment variable to `true`.

### Added

- Directly call fastify instance from nuxt server [#2377](https://github.com/ViewTube/viewtube/pull/2377)
- Detect theme from system [#2379](https://github.com/ViewTube/viewtube/pull/2379)
- Upgrade dependencies [#2380](https://github.com/ViewTube/viewtube/pull/2380)

### Changed

- Switch homepage to trending, as popular was causing issues [#2490](https://github.com/ViewTube/viewtube/pull/2490)

### Fixed

- Fix nuxt import on windows (only relevant for development) [#2377](https://github.com/ViewTube/viewtube/pull/2377)
- Fix "window is not defined" when logged in and "Rewrite YouTube URLs" is enabled [#2469](https://github.com/ViewTube/viewtube/pull/2469)
- Fix certain search terms not working [#2493](https://github.com/ViewTube/viewtube/pull/2493)

## [0.13.1]

### Fixed

- Fixed videoplayback proxy headers [#2376](https://github.com/ViewTube/viewtube/pull/2376)

## [0.13.0]

### Added

- Reworked authentication with new devices interface in profile [#2186](https://github.com/ViewTube/viewtube/pull/2186)
- Add support for socks proxies [#2269](https://github.com/ViewTube/viewtube/pull/2269)

### Fixed

- Make client cookie logic more robust [#2259](https://github.com/ViewTube/viewtube/pull/2259)
- Upgrade packages and cleanup unused [#2261](https://github.com/ViewTube/viewtube/pull/2261)
- Fix history and profile page [#2282](https://github.com/ViewTube/viewtube/pull/2282)

## [0.12.2]

### Fixed

- Retry subscriptions on 429 rate limit [#2182](https://github.com/ViewTube/viewtube/pull/2182)
- Use proxy for videoplayback [#2196](https://github.com/ViewTube/viewtube/pull/2196)

## [0.12.1]

### Fixed

- Basic fix for livestreams [#2157](https://github.com/ViewTube/viewtube/pull/2157)
- Fix subscription search (Thanks @cyacedev) [#2159](https://github.com/ViewTube/viewtube/pull/2159)
- Fix rate limit for proxy [#2165](https://github.com/ViewTube/viewtube/pull/2165)
- Fix the ability to upload a profile image [#2161](https://github.com/ViewTube/viewtube/pull/2161)

### Added

- Option to rewrite YouTube URIs in descriptions to ViewTube URIs (Thanks @cyacedev) [#2164](https://github.com/ViewTube/viewtube/pull/2164)
- Add capability to export subscriptions (Thanks @cyacedev) [#2162](https://github.com/ViewTube/viewtube/pull/2162)

## [0.12.0]

### Fixed

- Properly format author name in watch page title (Thanks @mattfbacon) [#2147](https://github.com/ViewTube/viewtube/pull/2147)
- Don't rate limit client [#2149](https://github.com/ViewTube/viewtube/pull/2149)
- Fix subscription job [#2151](https://github.com/ViewTube/viewtube/pull/2151)

### Added

- New subscription importing experience (Thanks @cyacedev) [#2151](https://github.com/ViewTube/viewtube/pull/2151)

## [0.11.0] - 2023-08-11

### Added

- Create release on CHANGELOG.md edit [#2085](https://github.com/ViewTube/viewtube/pull/2085)
- Switch to unocss icons and include in build [#2088](https://github.com/ViewTube/viewtube/pull/2088)
- Add API route for DASH manifest [#2116](https://github.com/ViewTube/viewtube/pull/2118)

### Fixed

- Fix log file list in admin panel [#2104](https://github.com/ViewTube/viewtube/pull/2104)
- Use undici.request for videoplayback proxy [#2113](https://github.com/ViewTube/viewtube/pull/2113)
- Use non-broken cache-manager-redis-yet [#2115](https://github.com/ViewTube/viewtube/pull/2115)
- Switch to youtube.js for search [#2119](https://github.com/ViewTube/viewtube/pull/2119)
- Fix channel home page [#2119](https://github.com/ViewTube/viewtube/pull/2119)

### Changed

- Use rotating proxy for subscription list fetches [#2105](https://github.com/ViewTube/viewtube/pull/2105)

## [0.10.0] - 2023-01-30

### Added

- Migrate to Nuxt 3 [#1425](https://github.com/ViewTube/viewtube/pull/1425)
  - Rewrite some plugins and components to work with nuxt 3
  - Major internal cleanup
  - Some performance improvements
  - Small UI improvements
  - Commit history: https://gist.github.com/mauriceoegerli/37a3143258e0ee0a1cd5f3c1df2207bb
- Upgrade nestjs to v9 [#1425](https://github.com/ViewTube/viewtube/pull/1425)
- Rewrite channel page [#1425](https://github.com/ViewTube/viewtube/pull/1425) [#1642](https://github.com/ViewTube/viewtube/pull/1642) [#1652](https://github.com/ViewTube/viewtube/pull/1652)
  - All content is now available, instead of just the channel homepage
  - New channel api
  - Mobile friendly touch navigation
- Add dislikes from return youtube dislike [#1373](https://github.com/ViewTube/viewtube/pull/1373)
- Warn users about username being case sensitive [#1384](https://github.com/ViewTube/viewtube/pull/1384)
- Don't allow creation of user with same name of any case, restrict username length when registering [#1385](https://github.com/ViewTube/viewtube/pull/1385)
- Add Password Change Function [#1476](https://github.com/ViewTube/viewtube/pull/1476)
- Run nightly tests [#1496](https://github.com/ViewTube/viewtube/pull/1496)
- Add tests project with cypress e2e tests [#1553](https://github.com/ViewTube/viewtube/pull/1553) [#1565](https://github.com/ViewTube/viewtube/pull/1565)
- Show current commit version in About panel [#1600](https://github.com/ViewTube/viewtube/pull/1600)

### Changed

- Switch to GitHub actions [#1477](https://github.com/ViewTube/viewtube/pull/1477) [#1480](https://github.com/ViewTube/viewtube/pull/1480) [#1482](https://github.com/ViewTube/viewtube/pull/1482)
- Remove requirement for VIEWTUBE_URL environment variable [#1588](https://github.com/ViewTube/viewtube/pull/1588)

### Fixed

- Fix daily refresh of popular page [#1387](https://github.com/ViewTube/viewtube/pull/1387)
- Create database index for videobasicinfo [#1391](https://github.com/ViewTube/viewtube/pull/1391)
- Handle subscriptions importing errors [#1478](https://github.com/ViewTube/viewtube/pull/1478) (Thanks @cyacedev)
- Always resize tiny thumbnails to 36x36 [#1486](https://github.com/ViewTube/viewtube/pull/1486)
- Change base docker image for compatibility with Raspi [#1472](https://github.com/ViewTube/viewtube/pull/1472) (Thanks @beardeddude)
- Cleanup unused and old files [#1533](https://github.com/ViewTube/viewtube/pull/1533)
- Improve docker image size [#1546](https://github.com/ViewTube/viewtube/pull/1546)
- UI fixes and other refactorings [#1590](https://github.com/ViewTube/viewtube/pull/1590)
- Formatting and cleanup [#1598](https://github.com/ViewTube/viewtube/pull/1598)
- Many other fixes

## [0.9.1] - 2022-01-19

### Fixed

- Fix ytdl throttling [#1172](https://github.com/ViewTube/viewtube/pull/1172)

### Added

- Lots of dependency upgrades

## [0.9.0] - 2021-11-19

### Fixed

- Subscribe button reliability [#941](https://github.com/ViewTube/viewtube/pull/941)
- Encoding for search autocomplete [#929](https://github.com/ViewTube/viewtube/pull/929)
- Video playback on ios [#917](https://github.com/ViewTube/viewtube/pull/766)
- Disable CSP on non-https instances [#1070](https://github.com/ViewTube/viewtube/pull/1070)
- Disable some unnecessarily heavy database requests to improve performance [#1102](https://github.com/ViewTube/viewtube/pull/1102)
- Improve CI and build performance [#1081](https://github.com/ViewTube/viewtube/pull/1081)
- Dont set secure cookie on non-https connections [#1071](https://github.com/ViewTube/viewtube/pull/1071)
- Other small bugfixes

### Added

- High quality video support using MPEG-DASH [#912](https://github.com/ViewTube/viewtube/pull/912)
- Video player keybindings [#932](https://github.com/ViewTube/§/pull/932)
- Add CSV import for youtube takeout format (Thanks @cyacedev) [#984](https://github.com/ViewTube/viewtube/pull/984)
- Add healthcheck for docker [45ceb45](https://github.com/ViewTube/viewtube/commit/45ceb454ab203fba1d9ee18ee3a584112ab5a6de)
- Switched to a yarn 2 monorepo using pnp [#988](https://github.com/ViewTube/viewtube/pull/988)
- Reduce required environment variables [#1067](https://github.com/ViewTube/viewtube/pull/1067)
- Lots of dependency upgrades

## [0.8.0] - 2021-08-29

### Fixed

- Run subscriptions job in batches [#766](https://github.com/ViewTube/viewtube/pull/766)
- Smaller build by removing unused dependencies [#841](https://github.com/ViewTube/viewtube/pull/841)
- Livestream VODs are playable now [#849](https://github.com/ViewTube/viewtube/pull/849)
- Fix Livestreams on iOS by using native HLS support [#849](https://github.com/ViewTube/viewtube/pull/849)
- Remove Invidious instance switcher, as invidious is no longer used in the frontend [#858](https://github.com/ViewTube/viewtube/pull/858)
- Properly size channel thumbnails [#859](https://github.com/ViewTube/viewtube/pull/859)

### Added

- Use redis for API caching [#474](https://github.com/ViewTube/viewtube/pull/474)
- Queue system for the subscriptions job [#474](https://github.com/ViewTube/viewtube/pull/474)
- Add statistics api for user registrations [#754](https://github.com/ViewTube/viewtube/pull/754)
- Ability to autoplay video [#795](https://github.com/ViewTube/viewtube/pull/795)
- Ability to autoplay the next video [#795](https://github.com/ViewTube/viewtube/pull/795)
- Add loop video control [#795](https://github.com/ViewTube/viewtube/pull/795)
- Adjustable video speed [#795](https://github.com/ViewTube/viewtube/pull/795)
- Add settings for autoplay, autoplay next video, loop and speed [#795](https://github.com/ViewTube/viewtube/pull/795)
- Add setting to disable subscriptions on home screen [#795](https://github.com/ViewTube/viewtube/pull/795)
- Add default quality setting [#795](https://github.com/ViewTube/viewtube/pull/795)
- Switch from express to fastify [#830](https://github.com/ViewTube/viewtube/pull/830)
- Implement new API security measures [#830](https://github.com/ViewTube/viewtube/pull/830)
- Add rate limiting (max. 100 request per minute per endpoint, 1000 for proxy) [#830](https://github.com/ViewTube/viewtube/pull/830)
- Add end-to-end tests for core endpoints [#830](https://github.com/ViewTube/viewtube/pull/830)
- Implement clustering for better multi-core usage [#845](https://github.com/ViewTube/viewtube/pull/845)

## [0.7.0] - 2021-07-13

### Fixed

- Don't use external proxy for video thumbnails [#527](https://github.com/ViewTube/viewtube/pull/527)
- Fix top level comments (responses not working yet) [#535](https://github.com/ViewTube/viewtube/pull/535)
- Fix videoplayer for touch devices [#638](https://github.com/ViewTube/viewtube/pull/638)
- Skip sponsorblock segments properly [#702](https://github.com/ViewTube/viewtube/pull/702)
- Many more tweaks and fixes
- Update dependencies

### Added

- Use webp for channel images [#529](https://github.com/ViewTube/viewtube/pull/529)
- Add livestream support [#536](https://github.com/ViewTube/viewtube/pull/536)
- Add profile image support [#630](https://github.com/ViewTube/viewtube/pull/630)
- Add youtube playlists support [#735](https://github.com/ViewTube/viewtube/pull/735)

## [0.6.1] - 2021-03-29

### Fixed

- Static folder missing

## [0.6.0] - 2021-03-29

### Fixed

- Improve display of errors [#357](https://github.com/ViewTube/viewtube/pull/357)
- Fix video playback on ios [#353](https://github.com/ViewTube/viewtube/issues/353), [#446](https://github.com/ViewTube/viewtube/pull/446)
- Disable scrolling for main page when popup is open [#508](https://github.com/ViewTube/viewtube/pull/508)
- Fix input field styles for chrome autofill [#65](https://github.com/ViewTube/viewtube/issues/65), [#508](https://github.com/ViewTube/viewtube/pull/508)
- Fix disabled subscribe button being reachable with tab button [#66](https://github.com/ViewTube/viewtube/issues/66), [#508](https://github.com/ViewTube/viewtube/pull/508)
- Fix duplicate and missing meta tags [#70](https://github.com/ViewTube/viewtube/issues/70), [#508](https://github.com/ViewTube/viewtube/pull/508)
- Fix too wide icon on ios [#340](https://github.com/ViewTube/viewtube/issues/340), [#508](https://github.com/ViewTube/viewtube/pull/508)
- Improve subscription job [#508](https://github.com/ViewTube/viewtube/pull/508)
- Fix settings and about page layout [#340](https://github.com/ViewTube/viewtube/issues/340), [#508](https://github.com/ViewTube/viewtube/pull/508)
- Lots of size and speed optimizations [#515](https://github.com/ViewTube/viewtube/pull/515), [#508](https://github.com/ViewTube/viewtube/pull/508)
- Lots of other small fixes
- Update dependencies

### Added

- Add image proxy [#425](https://github.com/ViewTube/viewtube/pull/425)
- New video entry design [#461](https://github.com/ViewTube/viewtube/pull/461)
- Migrated to vue composition api [#434](https://github.com/ViewTube/viewtube/pull/434)
- Support for videos using cipher [#498](https://github.com/ViewTube/viewtube/pull/498)
- Store user settings on the server [#397](https://github.com/ViewTube/viewtube/pull/397)
- Add profile page [#397](https://github.com/ViewTube/viewtube/pull/397)
- Store video history and progress on the server [#397](https://github.com/ViewTube/viewtube/pull/397)
- Store video volume locally [#397](https://github.com/ViewTube/viewtube/pull/397)

## [0.5.0] - 2021-02-04

### Fixed

- Improve error handling, cleanup [#289](https://github.com/ViewTube/viewtube/pull/289)
- Other small fixes
- Update dependencies

### Added

- Store homepage serverside, refreshes once a day from invidious [#254](https://github.com/ViewTube/viewtube/pull/258), [#258](https://github.com/ViewTube/viewtube/pull/254)
- Sponsorblock support [#253](https://github.com/ViewTube/viewtube/pull/253)
- Chapter support (parses from description) [#182](https://github.com/ViewTube/viewtube/pull/182)
- New search experience using ytsr 3.x [#310](https://github.com/ViewTube/viewtube/pull/310)
- Clickable timestamps in description [#182](https://github.com/ViewTube/viewtube/pull/182)
- Quality selection in videoplayer [#182](https://github.com/ViewTube/viewtube/pull/182)
- Support MediaSession API (progressbar in mobile chrome notification) [#182](https://github.com/ViewTube/viewtube/pull/182)
- Fix videoplayer volume selector for mobile [#182](https://github.com/ViewTube/viewtube/pull/182)
- Double tap to go forwards/backwards in videoplayer [#182](https://github.com/ViewTube/viewtube/pull/182)
- Use arrow keys for volume in videoplayer [#182](https://github.com/ViewTube/viewtube/pull/182)

## [0.4.1] - 2020-10-26

### Fixed

- Set API timeout to 30 seconds [#183](https://github.com/ViewTube/viewtube/pull/183)

## [0.4.0] - 2020-10-20

### Added

- Improved subscriptions interface with pagination and search [#151](https://github.com/ViewTube/viewtube/pull/151)
- Standardized changelog file [#158](https://github.com/ViewTube/viewtube/pull/158)
- Migrate client to typescript [#164](https://github.com/ViewTube/viewtube/pull/164)
- Update dependencies

### Fixed

- Improved error handling
- Channels API fixes

## [0.3.1] - 2020-09-24

### Fixed

- Fix notification on chrome
- Update dependencies
- Minor fixes

## [0.3.0] - 2020-09-22

### Added

- Support for invidious opml exports (normal and for newpipe/freetube) [#94](https://github.com/ViewTube/viewtube/issues/94)
- Show a results page after subscription import

### Fixed

- Refresh subscription page after import
- Reduced dockerfile size by clearing install cache

## [0.2.1] - 2020-09-19

### Fixed

- Fix invidious api url on some pages
- Fix the sticky channel title

## [0.2.0] - 2020-09-19

### Added

- New search experience [#76](https://github.com/ViewTube/viewtube/issues/76)
- New search API [#61](https://github.com/ViewTube/viewtube/issues/76)
- Undo-able unsubscribe in subscription manager

### Fixed

- Reduced Dockerfile size
- Updated packages
- Reduced dependencies
- Manual route specification
- Split and named webpack chunks [#71](https://github.com/ViewTube/viewtube/issues/71)
- Environment variables are transferred to frontend
- Video player seekbar preview size
- Overall improved speed
- Switch from asyncData to fetch in some places
- Limit shown videos on home to improve performance
- Lots of other improvements

## [0.1.0] - 2020-09-18

### Added

- Initial release

[unreleased]: https://github.com/viewtube/viewtube/compare/v0.15.1...development
[0.15.1]: https://github.com/viewtube/viewtube/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/viewtube/viewtube/compare/v0.14.2...v0.15.0
[0.14.2]: https://github.com/viewtube/viewtube/compare/v0.14.1...v0.14.2
[0.14.1]: https://github.com/viewtube/viewtube/compare/v0.14.0...v0.14.1
[0.14.0]: https://github.com/viewtube/viewtube/compare/v0.13.1...v0.14.0
[0.13.1]: https://github.com/viewtube/viewtube/compare/v0.13.0...v0.13.1
[0.13.0]: https://github.com/viewtube/viewtube/compare/v0.12.2...v0.13.0
[0.12.2]: https://github.com/viewtube/viewtube/compare/v0.12.1...v0.12.2
[0.12.1]: https://github.com/viewtube/viewtube/compare/v0.12.0...v0.12.1
[0.12.0]: https://github.com/viewtube/viewtube/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/viewtube/viewtube/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/viewtube/viewtube/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/viewtube/viewtube/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/viewtube/viewtube/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/viewtube/viewtube/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/viewtube/viewtube/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/viewtube/viewtube/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/viewtube/viewtube/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/viewtube/viewtube/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/viewtube/viewtube/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/viewtube/viewtube/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/viewtube/viewtube/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/viewtube/viewtube/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/viewtube/viewtube/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/viewtube/viewtube/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/viewtube/viewtube/releases/tag/v0.1.0
