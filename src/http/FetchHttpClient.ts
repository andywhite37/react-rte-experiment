import { pipe, RTE, TE } from "../fp-ts-exports";
import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { httpContentTypeError, httpRequestError } from "./HttpError";

/**
 * Converts our HttpRequest abstraction into the fetch (DOM) Request
 */
export const httpRequestToFetchRequest = (request: HttpRequest): Request =>
  new Request(request.url, { ...request });

/**
 * Converts the fetch (DOM) Request into our HttpResponse abstraction
 */
export const fetchResponseToHttpResponse = (
  response: Response
): HttpResponse => {
  return {
    status: response.status,
    headers: {}, // TODO: convert Headers
    // TODO: not sure what/if we need to deal with the issue where you can only read the response body once. I'm using clone for now as a workaround.
    getBodyAsJson: TE.tryCatch(
      () => response.clone().json(),
      (error) => httpContentTypeError<"json">("json", error)
    ),
    getBodyAsText: TE.tryCatch(
      () => response.clone().json(),
      (error) => httpContentTypeError<"text">("text", error)
    ),
  };
};

/**
 * Implementation of HttpClient using Web API `fetch`
 */
export const fetchHttpClient: HttpClient = {
  sendRequest: pipe(
    RTE.ask<HttpRequest>(),
    RTE.chainTaskEitherK((request) =>
      TE.tryCatch(
        () => fetch(httpRequestToFetchRequest(request)),
        httpRequestError
      )
    ),
    RTE.map(fetchResponseToHttpResponse)
  ),
};
