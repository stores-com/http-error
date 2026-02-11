# http-error

[![Test](https://github.com/stores-com/http-error/actions/workflows/test.yml/badge.svg)](https://github.com/stores-com/http-error/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/stores-com/http-error/badge.svg)](https://coveralls.io/github/stores-com/http-error)

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

### `HttpError.from(response)`

Async factory that creates an `HttpError` and captures the response body:

- `err.text` — the response body as a string
- `err.json` — the parsed JSON (if the body is valid JSON)
- `err.cause` — the original `Response` object

The original response is not consumed (uses `response.clone()`).
