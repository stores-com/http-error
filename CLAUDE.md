# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@stores.com/http-error` is an Error subclass for non-ok HTTP responses from the Fetch API. It captures the response body as `.text` and `.json` for debugging.

## Commands

```bash
npm test              # Run tests
npm run coveralls     # Run tests with coverage
npx eslint .          # Lint
```

## Architecture

Single-file module exporting an `HttpError` class:
- `new HttpError(response)` — creates error with message `"${status} ${statusText}"`, sets `cause` to the response
- `HttpError.from(response)` — async factory that also captures `.text` and `.json` from the response body (using `.clone()` to avoid consuming the original)

## Coding Standards

- Arrow functions preferred
- `node:` prefix for built-in modules
- Alphabetize string arrays and YAML keys
- `node:test` flat test pattern with `{ concurrency: true }` on parent groups
- No destructuring
