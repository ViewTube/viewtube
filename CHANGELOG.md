# Changelog

This file is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[unreleased]: https://github.com/viewtube/viewtube-vue/compare/v0.5.0...main
[0.5.0]: https://github.com/viewtube/viewtube-vue/compare/v0.4.1...v0.5.0
[0.4.1]: https://github.com/viewtube/viewtube-vue/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/viewtube/viewtube-vue/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/viewtube/viewtube-vue/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/viewtube/viewtube-vue/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/viewtube/viewtube-vue/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/viewtube/viewtube-vue/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/viewtube/viewtube-vue/releases/tag/v0.1.0
