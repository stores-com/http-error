# Changelog

## 1.1.0

- `HttpError.from(response)` now aggregates `errors[]` entries from the response body into `err.message`, joined by `; `. For each entry, the first present of `message`, `detail`, or `title` is used — covering both the [GraphQL specification](https://spec.graphql.org/October2021/#sec-Errors) (`message`) and [JSON:API](https://jsonapi.org/format/#errors) (`detail` / `title`) envelope shapes. The default `"${status} ${statusText}"` message is still used when the body has no `errors[]`, or when none of the entries have any of those three fields.

## 1.0.0

- Initial release.
- `new HttpError(response)` — error with message `"${status} ${statusText}"` and `cause` set to the response.
- `HttpError.from(response)` — async factory that also captures `err.text` and `err.json`.
