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
    console.error(err.message); // "404 Not Found"
    console.error(err.text);    // Raw response body
    console.error(err.json);    // Parsed JSON (if applicable)
    console.error(err.cause);   // Original Response object
}
```

## API

### `new HttpError(response)`

Creates an error with message `"${status} ${statusText}"` and sets `cause` to the response.

### `HttpError.from(response, [json])`

Async factory that creates an `HttpError` and captures the response body:

- `err.text` — the response body as a string
- `err.json` — the parsed JSON (if the body is valid JSON)
- `err.cause` — the original `Response` object

When called with just a `response`, reads the body via `response.clone().text()` so the original response is not consumed.

When the caller has already consumed the body (via `response.json()`), pass the parsed body as the second argument to skip the body read. Useful for application-level error envelopes on otherwise-ok responses (GraphQL `data.errors[]`, REST 200-with-`errors[]`, etc.):

```javascript
const response = await fetch('https://api.example.com/graphql', { /* ... */ });
const json = await response.json();

if (json.errors?.length) {
    const err = await HttpError.from(response, json);
    err.message = json.errors.map(e => e.message).join('; ');
    throw err;
}
```

In that mode, `.json` is set to the supplied body, `.text` to `JSON.stringify(json)`, and the message defaults to `"${status} ${statusText}"` — override it after construction if you want a different one.
