# Changelog

This file is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2021-11-19

## Fixed

- Subscribe button reliability [#941](https://github.com/ViewTube/viewtube-vue/pull/941)
- Encoding for search autocomplete [#929](https://github.com/ViewTube/viewtube-vue/pull/929)
- Video playback on ios [#917](https://github.com/ViewTube/viewtube-vue/pull/766)
- Disable CSP on non-https instances [#1070](https://github.com/ViewTube/viewtube-vue/pull/1070)
- Disable some unnecessarily heavy database requests to improve performance [#1102](https://github.com/ViewTube/viewtube-vue/pull/1102)
- Improve CI and build performance [#1081](https://github.com/ViewTube/viewtube-vue/pull/1081)
- Dont set secure cookie on non-https connections [#1071](https://github.com/ViewTube/viewtube-vue/pull/1071)
- Other small bugfixes

## Added

- High quality video support using MPEG-DASH [#912](https://github.com/ViewTube/viewtube-vue/pull/912)
- Video player keybindings [#932](https://github.com/ViewTube/viewtube-vue/pull/932)
- Add CSV import for youtube takeout format (thanks to @cyacedev) [#984](https://github.com/ViewTube/viewtube-vue/pull/984)
- Add healthcheck for docker [45ceb45](https://github.com/ViewTube/viewtube-vue/commit/45ceb454ab203fba1d9ee18ee3a584112ab5a6de)
- Switched to a yarn 2 monorepo using pnp [#988](https://github.com/ViewTube/viewtube-vue/pull/988)
- Reduce required environment variables [#1067](https://github.com/ViewTube/viewtube-vue/pull/1067)
- Lots of dependency upgrades

## [0.8.0] - 2021-08-29

## Fixed

- Run subscriptions job in batches [#766](https://github.com/ViewTube/viewtube-vue/pull/766)
- Smaller build by removing unused dependencies [#841](https://github.com/ViewTube/viewtube-vue/pull/841)
- Livestream VODs are playable now [#849](https://github.com/ViewTube/viewtube-vue/pull/849)
- Fix Livestreams on iOS by using native HLS support [#849](https://github.com/ViewTube/viewtube-vue/pull/849)
- Remove Invidious instance switcher, as invidious is no longer used in the frontend [#858](https://github.com/ViewTube/viewtube-vue/pull/858)
- Properly size channel thumbnails [#859](https://github.com/ViewTube/viewtube-vue/pull/859)

## Added

- Use redis for API caching [#474](https://github.com/ViewTube/viewtube-vue/pull/474)
- Queue system for the subscriptions job [#474](https://github.com/ViewTube/viewtube-vue/pull/474)
- Add statistics api for user registrations [#754](https://github.com/ViewTube/viewtube-vue/pull/754)
- Ability to autoplay video [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Ability to autoplay the next video [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Add loop video control [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Adjustable video speed [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Add settings for autoplay, autoplay next video, loop and speed [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Add setting to disable subscriptions on home screen [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Add default quality setting [#795](https://github.com/ViewTube/viewtube-vue/pull/795)
- Switch from express to fastify [#830](https://github.com/ViewTube/viewtube-vue/pull/830)
- Implement new API security measures [#830](https://github.com/ViewTube/viewtube-vue/pull/830)
- Add rate limiting (max. 100 request per minute per endpoint, 1000 for proxy) [#830](https://github.com/ViewTube/viewtube-vue/pull/830)
- Add end-to-end tests for core endpoints [#830](https://github.com/ViewTube/viewtube-vue/pull/830)
- Implement clustering for better multi-core usage [#845](https://github.com/ViewTube/viewtube-vue/pull/845)

## [0.7.0] - 2021-07-13

## Fixed

- Don't use external proxy for video thumbnails [#527](https://github.com/ViewTube/viewtube-vue/pull/527)
- Fix top level comments (responses not working yet) [#535](https://github.com/ViewTube/viewtube-vue/pull/535)
- Fix videoplayer for touch devices [#638](https://github.com/ViewTube/viewtube-vue/pull/638)
- Skip sponsorblock segments properly [#702](https://github.com/ViewTube/viewtube-vue/pull/702)
- Many more tweaks and fixes
- Update dependencies

## Added

- Use webp for channel images [#529](https://github.com/ViewTube/viewtube-vue/pull/529)
- Add livestream support [#536](https://github.com/ViewTube/viewtube-vue/pull/536)
- Add profile image support [#630](https://github.com/ViewTube/viewtube-vue/pull/630)
- Add youtube playlists support [#735](https://github.com/ViewTube/viewtube-vue/pull/735)

## [0.6.1] - 2021-03-29

### Fixed

- Static folder missing

## [0.6.0] - 2021-03-29

### Fixed

- Improve display of errors [#357](https://github.com/ViewTube/viewtube-vue/pull/357)
- Fix video playback on ios [#353](https://github.com/ViewTube/viewtube-vue/issues/353), [#446](https://github.com/ViewTube/viewtube-vue/pull/446)
- Disable scrolling for main page when popup is open [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Fix input field styles for chrome autofill [#65](https://github.com/ViewTube/viewtube-vue/issues/65), [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Fix disabled subscribe button being reachable with tab button [#66](https://github.com/ViewTube/viewtube-vue/issues/66), [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Fix duplicate and missing meta tags [#70](https://github.com/ViewTube/viewtube-vue/issues/70), [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Fix too wide icon on ios [#340](https://github.com/ViewTube/viewtube-vue/issues/340), [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Improve subscription job [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Fix settings and about page layout [#340](https://github.com/ViewTube/viewtube-vue/issues/340), [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Lots of size and speed optimizations [#515](https://github.com/ViewTube/viewtube-vue/pull/515), [#508](https://github.com/ViewTube/viewtube-vue/pull/508)
- Lots of other small fixes
- Update dependencies

### Added

- Add image proxy [#425](https://github.com/ViewTube/viewtube-vue/pull/425)
- New video entry design [#461](https://github.com/ViewTube/viewtube-vue/pull/461)
- Migrated to vue composition api [#434](https://github.com/ViewTube/viewtube-vue/pull/434)
- Support for videos using cipher [#498](https://github.com/ViewTube/viewtube-vue/pull/498)
- Store user settings on the server [#397](https://github.com/ViewTube/viewtube-vue/pull/397)
- Add profile page [#397](https://github.com/ViewTube/viewtube-vue/pull/397)
- Store video history and progress on the server [#397](https://github.com/ViewTube/viewtube-vue/pull/397)
- Store video volume locally [#397](https://github.com/ViewTube/viewtube-vue/pull/397)

## [0.5.0] - 2021-02-04

### Fixed

- Improve error handling, cleanup [#289](https://github.com/ViewTube/viewtube-vue/pull/289)
- Other small fixes
- Update dependencies

## Added

- Store homepage serverside, refreshes once a day from invidious [#254](https://github.com/ViewTube/viewtube-vue/pull/258), [#258](https://github.com/ViewTube/viewtube-vue/pull/254)
- Sponsorblock support [#253](https://github.com/ViewTube/viewtube-vue/pull/253)
- Chapter support (parses from description) [#182](https://github.com/ViewTube/viewtube-vue/pull/182)
- New search experience using ytsr 3.x [#310](https://github.com/ViewTube/viewtube-vue/pull/310)
- Clickable timestamps in description [#182](https://github.com/ViewTube/viewtube-vue/pull/182)
- Quality selection in videoplayer [#182](https://github.com/ViewTube/viewtube-vue/pull/182)
- Support MediaSession API (progressbar in mobile chrome notification) [#182](https://github.com/ViewTube/viewtube-vue/pull/182)
- Fix videoplayer volume selector for mobile [#182](https://github.com/ViewTube/viewtube-vue/pull/182)
- Double tap to go forwards/backwards in videoplayer [#182](https://github.com/ViewTube/viewtube-vue/pull/182)
- Use arrow keys for volume in videoplayer [#182](https://github.com/ViewTube/viewtube-vue/pull/182)

## [0.4.1] - 2020-10-26

### Fixed

- Set API timeout to 30 seconds [#183](https://github.com/ViewTube/viewtube-vue/pull/183)

## [0.4.0] - 2020-10-20

### Added

- Improved subscriptions interface with pagination and search [#151](https://github.com/ViewTube/viewtube-vue/pull/151)
- Standardized changelog file [#158](https://github.com/ViewTube/viewtube-vue/pull/158)
- Migrate client to typescript [#164](https://github.com/ViewTube/viewtube-vue/pull/164)
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

- Support for invidious opml exports (normal and for newpipe/freetube) [#94](https://github.com/ViewTube/viewtube-vue/issues/94)
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

- New search experience [#76](https://github.com/ViewTube/viewtube-vue/issues/76)
- New search API [#61](https://github.com/ViewTube/viewtube-vue/issues/76)
- Undo-able unsubscribe in subscription manager

### Fixed

- Reduced Dockerfile size
- Updated packages
- Reduced dependencies
- Manual route specification
- Split and named webpack chunks [#71](https://github.com/ViewTube/viewtube-vue/issues/71)
- Environment variables are transferred to frontend
- Video player seekbar preview size
- Overall improved speed
- Switch from asyncData to fetch in some places
- Limit shown videos on home to improve performance
- Lots of other improvements

## [0.1.0] - 2020-09-18

- Initial release

[unreleased]: https://github.com/viewtube/viewtube-vue/compare/v0.9.0...development
[0.9.0]: https://github.com/viewtube/viewtube-vue/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/viewtube/viewtube-vue/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/viewtube/viewtube-vue/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/viewtube/viewtube-vue/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/viewtube/viewtube-vue/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/viewtube/viewtube-vue/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/viewtube/viewtube-vue/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/viewtube/viewtube-vue/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/viewtube/viewtube-vue/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/viewtube/viewtube-vue/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/viewtube/viewtube-vue/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/viewtube/viewtube-vue/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/viewtube/viewtube-vue/releases/tag/v0.1.0
