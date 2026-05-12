# Changelog

## 1.1.0

- `HttpError.from(response)` now aggregates `errors[].message` entries from the response body into `err.message`, joined by `; `. This matches the GraphQL/JSON:API/REST-with-errors convention used by several APIs that signal application-level failures via a body envelope rather than (or in addition to) HTTP status codes. The default `"${status} ${statusText}"` message is still used when the body has no `errors[]`.

## 1.0.0

- Initial release.
- `new HttpError(response)` — error with message `"${status} ${statusText}"` and `cause` set to the response.
- `HttpError.from(response)` — async factory that also captures `err.text` and `err.json`.
