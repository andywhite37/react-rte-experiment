import * as t from "io-ts";
export interface NotFoundError {
  tag: "notFoundError";
}

export const notFoundError: NotFoundError = { tag: "notFoundError" };

// Just alias io-ts Errors here - but in reality, we'd probably want to decouple ourselves from io-ts with a thin layer of abstraction
export type DecodeError = t.Errors;
