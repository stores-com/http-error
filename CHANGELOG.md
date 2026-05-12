# Changelog

## 1.1.0

- `HttpError.from(response)` now aggregates `errors[].message` entries from the response body into `err.message`, joined by `; `. This matches the [GraphQL specification](https://spec.graphql.org/October2021/#sec-Errors) (errors in `data.errors[]` on 200 OK) and other APIs that follow the same body envelope. The default `"${status} ${statusText}"` message is still used when the body has no `errors[]`. [JSON:API](https://jsonapi.org/format/#errors) and [RFC 9457 Problem Details](https://datatracker.ietf.org/doc/html/rfc9457) define structurally similar envelopes but use `detail`/`title` instead of `message`; callers using those shapes should override `err.message` after construction.

## 1.0.0

- Initial release.
- `new HttpError(response)` — error with message `"${status} ${statusText}"` and `cause` set to the response.
- `HttpError.from(response)` — async factory that also captures `err.text` and `err.json`.
