# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-05-26
### Added
- `HttpError.from()` accepts an optional second argument — an already-parsed JSON body. `from(response)` reads the body via `response.clone()` as before; `from(response, json)` uses the supplied body instead of re-reading the response, for a 200 response whose JSON you've already read (e.g. an `errors[]` envelope), since a response body can only be read once. The error keeps the response status and `cause`. Backward compatible.

## [1.1.0] - 2026-05-11
### Added
- `HttpError.from(response)` now aggregates `errors[]` entries from the response body into `err.message`, joined by `; `. For each entry, `message` is used if present, otherwise `detail` — covering both the [GraphQL specification](https://spec.graphql.org/October2021/#sec-Errors) (`message`) and [JSON:API](https://jsonapi.org/format/#errors) (`detail`) envelope shapes. The default `"${status} ${statusText}"` message is still used when the body has no `errors[]`, or when no entry has either field.

## [1.0.0] - 2026-02-11
### Added
- Initial release.
- `new HttpError(response)` — error with message `"${status} ${statusText}"` and `cause` set to the response.
- `HttpError.from(response)` — async factory that also captures `err.text` and `err.json`.
