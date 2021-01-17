import {pipe} from "fp-ts/lib/pipeable";
import {E, RTE, TE} from "../fp-ts-exports";
import {DecodeError} from "../util/decode";
import {
  HttpContentTypeError,
  HttpRequestError,
  HttpResponseStatusError,
  httpResponseStatusError,
} from "./HttpError";

/**
 * HTTP methods
 *
 * TODO: might want to allow extensibility to custom/unknown methods
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * An abstraction around a HTTP request to avoid coupling to a specific implementation
 *
 * TODO: There are things that are missing here, but could be added as-needed
 */
export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
}

/**
 * An abstraction around a HTTP response to avoid coupling to a specific implementation
 *
 * TODO: There are things that are missing here, but could be added as-needed
 */
export interface HttpResponse {
  status: number;
  headers?: Record<string, string>;
  getBodyAsJson: TE.TaskEither<HttpContentTypeError<"json">, unknown>;
  getBodyAsText: TE.TaskEither<HttpContentTypeError<"text">, string>;
}

/**
 * A small, dedicated interface of methods related to making HTTP requests
 */
export interface HttpClient {
  sendRequest(request: HttpRequest): TE.TaskEither<HttpRequestError, HttpResponse>;
}

/**
 * Module intended for use as an RTE dependency
 */
export interface HttpClientEnv {
  httpClient: HttpClient;
}

/**
 * Top-level function for sending HTTP requests.
 *
 * This is basically an RTE version of the sendRequest method exposed by HttpClient
 *
 * It's advisable to use this as the entry point, then compose in the desired processing functions, like checking status codes, decoding, etc.
 */
export const sendRequest = (
  httpRequest: HttpRequest
): RTE.ReaderTaskEither<HttpClientEnv, HttpRequestError, HttpResponse> =>
  pipe(
    RTE.asks((m: HttpClientEnv) => m.httpClient),
    RTE.chainTaskEitherKW((httpClient) => httpClient.sendRequest(httpRequest))
  );

/**
 * Ensures a HttpResponse has the given status range
 */
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

/**
 * Ensures an HttpResponse status is in the 2xx range
 */
export const ensure2xx = ensureStatusRange(200, 300);

/**
 * Basic helper for sending GET request and decoding a 2xx response body
 *
 * This is not intended to be the end-all solution to every GET request - it's just an example of how to compose lower-level functions to build
 * up the desired computation.
 *
 * E.g. if you want to handle errors in a specific way, you'd need to handle different statuses and decode responses as desired. This function doesn't do that.
 */
export const sendBasicGetRequest = <A>(
  url: string,
  decode: (raw: unknown) => E.Either<DecodeError, A>
): RTE.ReaderTaskEither<
  HttpClientEnv,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | DecodeError,
  A
> =>
  pipe(
    sendRequest({method: "GET", url}),
    // Note: this function makes the assumption that any 2xx response contains a JSON body that can be decoded to an A.
    // This might not apply to all types of GET requests - if it doesn't apply to your use case, write a different function that does what you need.
    RTE.chainEitherKW(ensure2xx),
    RTE.chainTaskEitherKW((response) => response.getBodyAsJson),
    RTE.chainEitherKW(decode)
  );

// TODO: add other common methods/helpers here
