import { RTE, TE } from "./fp-ts-exports";

export type HttpRequestError = {
  tag: "httpRequestError";
  error: unknown;
};

export const httpRequestError = (error: unknown): HttpRequestError => ({
  tag: "httpRequestError",
  error,
});

export type HttpContentTypeError = {
  tag: "httpContentTypeError";
  error: unknown;
};

export const httpContentTypeError = (error: unknown): HttpContentTypeError => ({
  tag: "httpContentTypeError",
  error,
});

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface HttpRequest {
  method: HttpMethod;
  url: string;
  headers?: Record<string, string>;
}

export interface HttpResponse {
  status: number;
  headers?: Record<string, string>;
  getBodyAsJson: TE.TaskEither<HttpContentTypeError, unknown>;
  getBodyAsText: TE.TaskEither<HttpContentTypeError, string>;
}

export interface HttpClient {
  sendRequest: RTE.ReaderTaskEither<
    HttpRequest,
    HttpRequestError,
    HttpResponse
  >;
  //sendRequest: (request: HttpRequest) => TE.TaskEither<RequestError, HttpResponse>;
}
