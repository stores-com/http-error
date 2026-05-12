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
     * Create an HttpError from a fetch Response, capturing the response body as text and JSON.
     * @param {Response} response - The fetch Response object.
     * @returns {Promise<HttpError>} Error with text and json properties.
     */
    static async from(response) {
        const err = new HttpError(response);
        err.text = await response.clone().text().catch(() => {});

        if (err.text) {
            try {
                err.json = JSON.parse(err.text);
            } catch {
                // Response body is not JSON
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
