# Errors

Throw, don't answer: `ApiExceptionFilter` turns anything thrown under `/api` into
`{ statusCode, message, description?, error }` and logs it once.

| Situation                                                        | Throw                      |
| ---------------------------------------------------------------- | -------------------------- |
| Malformed argument, provable without asking YouTube              | `BadRequestException`      |
| Needs a session (usually the guard's job)                        | `UnauthorizedException`    |
| Understood and refused: blocked video, host outside an allowlist | `ForbiddenException`       |
| YouTube does not have it: deleted, private, never existed        | `NotFoundException`        |
| YouTube answered unusably, or not at all                         | `BadGatewayException`      |
| Anything else                                                    | nothing — let it propagate |

Pass a string, or `{ message, description }` when there is detail worth showing. `message` is
rendered by the client, so keep it short.

- **404 vs 502 is the call that gets made wrong.** A broken renderer, a rejected token, a `TypeError`
  from our own mapper are 502s. A wrong 404 hides breakage — 4xx logs at `debug`, below the log file.
- **Never `throw new InternalServerErrorException(error)`** — an `Error`'s properties are not
  enumerable, so the client gets `{}`.
- **Never copy an upstream message into `message`.** Log it instead — the `*UpstreamFailed` helpers
  log the raw youtubei.js message at `debug`; the filter logs the request at `warn` (502) or `error`
  (500). Two lines, two levels, no duplication.
- **Never write an error onto `reply` by hand**, and don't worry about `@Header('Cache-Control')` —
  the filter replaces it with `no-store`.

Feature taxonomies live in one file: `core/channels/channel-errors.ts`,
`core/videos/video-errors.ts`. Their `is*Gone` predicates match a library's error type, never message
text.
