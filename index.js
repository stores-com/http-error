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

        return err;
    }

    /**
     * Create an HttpError from a fetch Response whose body has already been parsed as JSON.
     * Useful when an otherwise-ok response carries an application-level error envelope
     * (GraphQL data.errors[], REST 200 with errors[], etc.) and the caller has already
     * consumed the body via response.json().
     * @param {Response} response - The fetch Response object.
     * @param {*} json - The parsed JSON body.
     * @returns {HttpError} Error with text and json properties.
     */
    static fromJson(response, json) {
        const err = new HttpError(response);
        err.json = json;
        err.text = JSON.stringify(json);
        return err;
    }
}

module.exports = HttpError;
