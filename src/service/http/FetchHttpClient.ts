import { pipe, RTE, TE } from "../../util/fpts";
import { HttpClient, HttpRequest, HttpResponse } from "./HttpClient";
import { httpContentTypeError, httpRequestError } from "./HttpError";

export const httpRequestToFetchRequest = (request: HttpRequest): Request =>
  new Request(request.url, { ...request });

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

export const fetchHttpClient: HttpClient = {
  sendRequest: pipe(
    RTE.ask<HttpRequest>(),
    RTE.chainTaskEitherK((request) =>
      TE.tryCatch(() => {
        return fetch(httpRequestToFetchRequest(request));
      }, httpRequestError)
    ),
    RTE.map(fetchResponseToHttpResponse)
  ),
};
