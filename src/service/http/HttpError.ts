import { DecodeError } from "../../util/decode";
import { HttpResponse } from "./HttpClient";

export type HttpRequestError = {
  tag: "httpRequestError";
  error: unknown;
};

export const httpRequestError = (error: unknown): HttpRequestError => ({
  tag: "httpRequestError",
  error,
});

export type HttpContentTypeError<CT> = {
  tag: "httpContentTypeError";
  attemptedContentType: CT;
  error: unknown;
};

export const httpContentTypeError = <CT>(
  attemptedContentType: CT,
  error: unknown
): HttpContentTypeError<CT> => ({
  tag: "httpContentTypeError",
  attemptedContentType,
  error,
});

export type HttpResponseStatusError = {
  tag: "httpResponseStatusError";
  httpResponse: HttpResponse;
  status: number;
  minStatusInclusive: number;
  maxStatusExclusive: number;
};

export const httpResponseStatusError = (
  httpResponse: HttpResponse,
  status: number,
  minStatusInclusive: number,
  maxStatusExclusive: number
): HttpResponseStatusError => ({
  tag: "httpResponseStatusError",
  httpResponse,
  status,
  minStatusInclusive,
  maxStatusExclusive,
});

/**
 * Combination of common errors for JSON requests, for convenience
 */
export type HttpJsonError =
  | HttpRequestError
  | HttpContentTypeError<"json">
  | HttpResponseStatusError
  | DecodeError;
