const assert = require('node:assert');
const test = require('node:test');

const HttpError = require('../index');

test('HttpError', { concurrency: true }, async (t) => {
    t.test('should have correct name and message', async () => {
        const response = new Response('', { status: 404, statusText: 'Not Found' });
        const err = new HttpError(response);

        assert.strictEqual(err.name, 'HttpError');
        assert.strictEqual(err.message, '404 Not Found');
        assert.strictEqual(err.cause, response);
        assert(err instanceof Error);
    });

    t.test('should capture non-JSON response body as text', async () => {
        const response = new Response('Not JSON', { status: 400, statusText: 'Bad Request' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.name, 'HttpError');
        assert.strictEqual(err.message, '400 Bad Request');
        assert.strictEqual(err.text, 'Not JSON');
        assert.strictEqual(err.json, undefined);
    });

    t.test('should capture JSON response body', async () => {
        const response = new Response('{"error":"invalid"}', { status: 422, statusText: 'Unprocessable Entity' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, '422 Unprocessable Entity');
        assert.strictEqual(err.text, '{"error":"invalid"}');
        assert.deepStrictEqual(err.json, { error: 'invalid' });
    });

    t.test('should handle empty response body', async () => {
        const response = new Response('', { status: 500, statusText: 'Internal Server Error' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, '500 Internal Server Error');
        assert.strictEqual(err.text, '');
        assert.strictEqual(err.json, undefined);
    });

    t.test('should not consume the original response body', async () => {
        const response = new Response('body', { status: 400, statusText: 'Bad Request' });
        await HttpError.from(response);
        const text = await response.text();

        assert.strictEqual(text, 'body');
    });
});
