/**
 * Error class for non-ok HTTP responses from the Fetch API.
 * @extends Error
 */
class HttpError extends Error {
    /**
     * @param {Response} response - The fetch Response object.
     */
    constructor(response) {
        super(`${response.status} ${response.statusText}`, { cause: response });
        this.name = 'HttpError';
    }

    /**
     * Create an HttpError from a fetch Response, optionally with an already-parsed body.
     *
     * Pass just the `Response` — e.g. for a non-ok status — and the body is captured via
     * `response.clone()`, leaving the original intact. When you've already read the body — e.g.
     * a 200 response with an `errors[]` envelope, read with `await response.json()` — pass it as
     * the second argument so it isn't re-read (a `Response` body can only be read once). Either
     * way the error keeps the response status and `cause`.
     *
     * @param {Response} response - The fetch Response object.
     * @param {object} [json] - An already-parsed JSON body, used instead of reading the response.
     * @returns {Promise<HttpError>} Error with text and json properties.
     */
    static async from(response, json) {
        const err = new HttpError(response);

        if (json !== undefined) {
            err.json = json;

            try {
                err.text = JSON.stringify(json);
            } catch {
                // Body is not serializable
            }
        } else {
            try {
                err.text = await response.clone().text();
            } catch {
                // Body already consumed or otherwise unreadable
            }

            if (err.text) {
                try {
                    err.json = JSON.parse(err.text);
                } catch {
                    // Response body is not JSON
                }
            }
        }

        if (err.json?.errors?.length) {
            const messages = err.json.errors.map(e => e.message ?? e.detail).filter(Boolean);

            if (messages.length) {
                err.message = messages.join('; ');
            }
        }

        return err;
    }
}

module.exports = HttpError;
