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

    t.test('should aggregate body errors[] messages into err.message', async () => {
        const body = {
            errors: [
                { code: 'RATING.INVALID', message: 'Invalid account number' },
                { code: 'SERVICE.UNAVAILABLE', message: 'Service is currently unavailable' }
            ]
        };
        const response = new Response(JSON.stringify(body), { status: 200, statusText: 'OK' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, 'Invalid account number; Service is currently unavailable');
        assert.deepStrictEqual(err.json, body);
    });

    t.test('should leave message as status when body has no errors[]', async () => {
        const response = new Response('{"foo":"bar"}', { status: 200, statusText: 'OK' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, '200 OK');
    });

    t.test('should aggregate errors[] even on non-2xx responses', async () => {
        const body = { errors: [{ message: 'Account locked' }] };
        const response = new Response(JSON.stringify(body), { status: 403, statusText: 'Forbidden' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, 'Account locked');
        assert.deepStrictEqual(err.json, body);
    });

    t.test('should aggregate JSON:API-style errors[] using detail', async () => {
        const body = {
            errors: [
                { code: '422', detail: 'first name is required', title: 'Invalid Attribute' },
                { code: '422', detail: 'email is malformed', title: 'Invalid Attribute' }
            ]
        };
        const response = new Response(JSON.stringify(body), { status: 422, statusText: 'Unprocessable Entity' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, 'first name is required; email is malformed');
    });

    t.test('should keep default status message when errors[] entries have neither message nor detail', async () => {
        const body = { errors: [{ code: 'UNKNOWN', title: 'Service Unavailable' }] };
        const response = new Response(JSON.stringify(body), { status: 500, statusText: 'Internal Server Error' });
        const err = await HttpError.from(response);

        assert.strictEqual(err.message, '500 Internal Server Error');
    });

    t.test('should not throw when the response body has already been consumed', async () => {
        const response = new Response('{"errors":[{"message":"x"}]}', { status: 200, statusText: 'OK' });
        await response.json();

        const err = await HttpError.from(response);

        assert.strictEqual(err.name, 'HttpError');
        assert.strictEqual(err.message, '200 OK');
        assert.strictEqual(err.text, undefined);
        assert.strictEqual(err.json, undefined);
    });
});
