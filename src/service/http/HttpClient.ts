import { E, pipe, RTE, TE } from "../../util/fpts";
import { DecodeError } from "../../util/decode";
import {
  HttpContentTypeError,
  HttpJsonError,
  HttpRequestError,
  HttpResponseStatusError,
  httpResponseStatusError,
} from "./HttpError";

////////////////////////////////////////////////////////////////////////////////
// Intefaces
////////////////////////////////////////////////////////////////////////////////

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
}

export interface HttpResponse {
  status: number;
  headers?: Record<string, string>;
  getBodyAsJson: TE.TaskEither<HttpContentTypeError<"json">, unknown>;
  getBodyAsText: TE.TaskEither<HttpContentTypeError<"text">, string>;
}

export interface HttpClient {
  sendRequest(
    request: HttpRequest
  ): TE.TaskEither<HttpRequestError, HttpResponse>;
}

export interface HttpClientEnv {
  httpClient: HttpClient;
}

////////////////////////////////////////////////////////////////////////////////
// RTE and helper functions
////////////////////////////////////////////////////////////////////////////////

export const sendRequest = (
  httpRequest: HttpRequest
): RTE.ReaderTaskEither<HttpClientEnv, HttpRequestError, HttpResponse> =>
  pipe(
    RTE.asks((m: HttpClientEnv) => m.httpClient),
    RTE.chainTaskEitherKW((httpClient) => httpClient.sendRequest(httpRequest))
  );

export const ensureStatusRange = (
  minInclusive: number,
  maxExclusive: number
) => (
  httpResponse: HttpResponse
): E.Either<HttpResponseStatusError, HttpResponse> =>
  httpResponse.status >= minInclusive && httpResponse.status < maxExclusive
    ? E.right(httpResponse)
    : E.left(
        httpResponseStatusError(
          httpResponse,
          httpResponse.status,
          minInclusive,
          maxExclusive
        )
      );

export const ensure2xx = ensureStatusRange(200, 300);

// This is just a simple helper to demonstrate how to create helpers using lower-level utility
// methods. This is not intended to be the end-all solution for GET JSON requests
export const getJson = <A>(
  url: string,
  decode: (raw: unknown) => E.Either<DecodeError, A>
): RTE.ReaderTaskEither<HttpClientEnv, HttpJsonError, A> =>
  pipe(
    sendRequest({ method: "GET", url }),
    RTE.chainEitherKW(ensure2xx),
    RTE.chainTaskEitherKW((response) => response.getBodyAsJson),
    RTE.chainEitherKW(decode)
  );
