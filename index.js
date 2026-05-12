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
     * Pass `json` when the caller has already consumed the body via `response.json()` — useful
     * for application-level error envelopes on otherwise-ok responses (GraphQL data.errors[],
     * REST 200 with errors[], etc.) — to skip the body read.
     * @param {Response} response - The fetch Response object.
     * @param {*} [json] - The already-parsed JSON body, if the caller has it.
     * @returns {Promise<HttpError>} Error with text and json properties.
     */
    static async from(response, json) {
        const err = new HttpError(response);

        if (json !== undefined) {
            err.json = json;
            err.text = JSON.stringify(json);
            return err;
        }

        err.text = await response.clone().text().catch(() => {});

        if (err.text) {
            try {
                err.json = JSON.parse(err.text);
            } catch {
                // Response body is not JSON
            }
        }

        return err;
    }
}

module.exports = HttpError;
