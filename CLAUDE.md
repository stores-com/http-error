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
- `new HttpError(response)` — creates error with message `"${status} ${statusText}"` (the standard `node:http` reason phrase when `statusText` is empty), sets `cause` to the response
- `HttpError.from(response, [json])` — async factory that also sets `.text` and `.json`, from `json` when the caller already parsed the body, otherwise from `response.clone()` so the original is not consumed. When the body has an `errors[]` array, its `message`/`detail` values joined with `; ` replace `err.message`

## Coding Standards

- Arrow functions preferred
- `node:` prefix for built-in modules
- Alphabetize string arrays and YAML keys
- `node:test` flat test pattern with `{ concurrency: true }` on parent groups
- No destructuring
