# http-error

[![Test](https://github.com/stores-com/http-error/actions/workflows/test.yml/badge.svg)](https://github.com/stores-com/http-error/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/stores-com/http-error/badge.svg?branch=main&t=He5z4J)](https://coveralls.io/github/stores-com/http-error?branch=main)
[![npm version](https://img.shields.io/npm/v/@stores.com/http-error)](https://www.npmjs.com/package/@stores.com/http-error)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Error class for non-ok HTTP responses from the Fetch API. Captures the response body as text and JSON for debugging.

## Installation

```
$ npm install @stores.com/http-error
```

## Usage

```javascript
const HttpError = require('@stores.com/http-error');

const response = await fetch('https://api.example.com/items');

if (!response.ok) {
    throw await HttpError.from(response);
}
```

Catching errors:

```javascript
try {
    const response = await fetch('https://api.example.com/items');

    if (!response.ok) {
        throw await HttpError.from(response);
    }
} catch (err) {
    console.error(err.message); // "404 Not Found" — or aggregated body errors[].message values
    console.error(err.text);    // Raw response body
    console.error(err.json);    // Parsed JSON (if applicable)
    console.error(err.cause);   // Original Response object
}
```

### APIs that return errors in the body

Some APIs carry application-level failures in the response body rather than (or in addition to) HTTP status codes. `from()` reads the body and aggregates an `errors[]` envelope into the message automatically — for each entry, the first present of `message` or `detail` is used, joined by `; `. Codes and any other per-error fields stay on `err.json.errors[]`.

```javascript
const response = await fetch('https://api.example.com/graphql', { /* ... */ });

if (!response.ok) {
    throw await HttpError.from(response);
}

const json = await response.json();

if (json?.errors?.length) {
    throw await HttpError.from(response, json);
}

return json;
```

Pass just the `Response` while its body is still unread (the non-ok case). Once you've read it with `response.json()`, pass that parsed body as the second argument — `from(response, json)` — so it isn't re-read (a response body can only be read once). Either way the error keeps the response status and `cause`.

The default `"${status} ${statusText}"` message is used when the body has no `errors[]`.

This covers two widely used envelope shapes:

- [**GraphQL**](https://spec.graphql.org/October2021/#sec-Errors) — every response error entry includes a `message` string. Servers return 200 OK with a top-level `errors[]` for both partial and total failures. The same envelope is used by many REST APIs that signal application-level failures in the body rather than (or in addition to) HTTP status codes.
- [**JSON:API**](https://jsonapi.org/format/#errors) — error objects use `detail` for the per-occurrence explanation.

## API

### `new HttpError(response)`

Creates an error with message `"${status} ${statusText}"` and sets `cause` to the response.

### `HttpError.from(response, json)`

Async factory that creates an `HttpError` from a `Response` and captures the body:

- With **just a `Response`**, the body is read via `response.clone()` (the original is not consumed) and captured as `err.text` and `err.json`.
- With an **already-parsed `json`** as the second argument, that body is used directly (the response is not read), with `err.text` set to its JSON string — for a 200 response whose JSON you've already read.

In both cases:

- `err.text` — the body as a string
- `err.json` — the parsed JSON (if the body is/was valid JSON)
- `err.cause` — the original `Response`

If the body carries an `errors[]` array, `err.message` is set to each entry's `message` or `detail` (whichever is present, in that order) joined by `; ` instead of the default `"${status} ${statusText}"`. See [APIs that return errors in the body](#apis-that-return-errors-in-the-body) above.
