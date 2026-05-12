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

Some APIs carry application-level failures in the response body rather than (or in addition to) HTTP status codes. Inspect a clone of the body, then hand the untouched response to `from()` if you need to throw — `from()` reads the body and aggregates an `errors[]` envelope into the message automatically:

```javascript
const response = await fetch('https://api.example.com/graphql', { /* ... */ });
const json = await response.clone().json();

if (!response.ok || json.errors?.length) {
    throw await HttpError.from(response);
}

return json;
```

`err.message` is the joined human-readable text from each entry — `message`, falling back to `detail`. Codes and other per-error fields stay on `err.json.errors[]`.

This covers two widely used envelope shapes:

- [**GraphQL**](https://spec.graphql.org/October2021/#sec-Errors) — every response error entry includes a `message` string. Servers return 200 OK with a top-level `errors[]` (alongside `data`) for both partial and total failures. The same envelope is used by many REST APIs that signal application-level failures in the body rather than (or in addition to) HTTP status codes.
- [**JSON:API**](https://jsonapi.org/format/#errors) — error objects use `detail` for the per-occurrence explanation.

## API

### `new HttpError(response)`

Creates an error with message `"${status} ${statusText}"` and sets `cause` to the response.

### `HttpError.from(response)`

Async factory that creates an `HttpError` and captures the response body:

- `err.text` — the response body as a string
- `err.json` — the parsed JSON (if the body is valid JSON)
- `err.cause` — the original `Response` object

The original response is not consumed (uses `response.clone()`).

If the parsed body carries an `errors[]` array, `err.message` is set to each entry's `message` or `detail` (whichever is present, in that order) joined by `; ` instead of the default `"${status} ${statusText}"`. See [APIs that return errors in the body](#apis-that-return-errors-in-the-body) above.
