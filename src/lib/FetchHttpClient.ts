import { pipe, RTE, TE } from "./fp-ts-exports";
import {
  HttpClient,
  httpContentTypeError,
  HttpRequest,
  httpRequestError,
  HttpResponse,
} from "./HttpClient";

const requestToFetch = (request: HttpRequest): Request =>
  new Request(request.url, { ...request });

const responseFromFetch = (response: Response): HttpResponse => {
  return {
    status: response.status,
    headers: {}, // TODO: convert Headers
    // TODO: not sure what/if we need to deal with the issue where you can only read the response body once. I'm using clone for now as a workaround.
    getBodyAsJson: TE.tryCatch(
      () => response.clone().json(),
      httpContentTypeError
    ),
    getBodyAsText: TE.tryCatch(
      () => response.clone().json(),
      httpContentTypeError
    ),
  };
};

export const fetchHttpClient: HttpClient = {
  sendRequest: pipe(
    RTE.ask<HttpRequest>(),
    RTE.chainTaskEitherK((request) =>
      TE.tryCatch(() => fetch(requestToFetch(request)), httpRequestError)
    ),
    RTE.map(responseFromFetch)
  ),

  /* Alternative form using plain function rather than RTE
  sendRequest: (request: HttpRequest) =>
    pipe(
      TE.tryCatch(() => fetch(requestToFetch(request)), httpRequestError),
      TE.map(responseFromFetch)
    ),
    */
};
