import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import { DecodeError, NotFoundError, notFoundError } from "../AppErrors";
import { E, IO, O, RTE } from "../fp-ts-exports";

/**
 * Contains side-effecty functions for accessing localStorage
 *
 * The intention of this interface is to abstract all the functions that one might need for accessing localStorage
 * into a small, dedicated interface, for use as an RTE dependency.
 */
export interface LocalStorage {
  // TODO: IO here might be overkill
  getItem(key: string): IO.IO<O.Option<string>>;
  setItem(key: string, value: string): IO.IO<void>;
  removeItem(key: string): IO.IO<void>;
  clear: IO.IO<void>;
  size: IO.IO<void>;
}

/**
 * RTE dependency module
 *
 * This is intended to be used as an RTE dependency, which can be easily intersected with other modules - see the ZIO module pattern.
 *
 * E.g. ReaderTaskEither<LocalStorageModule & HttpClientModule & OtherService, ...>
 */
export interface LocalStorageModule {
  localStorage: LocalStorage;
}

// TODO: note that the below functiosn would be better as `ReaderIOEither` (or even maybe even `ReaderIO`), but those don't exist in fp-ts at this time.
// They would be easy to create though, and would be liftable into RTE, just like all the other stuff.

/**
 * Gets an item from localStorage
 *
 * This is the LocalStorage interface method exposed as an RTE
 */
export const getItem = (
  key: string
): RTE.ReaderTaskEither<LocalStorageModule, NotFoundError, string> =>
  pipe(
    RTE.asks((m: LocalStorageModule) => m.localStorage),
    RTE.chainEitherKW((localStorage) =>
      pipe(
        localStorage.getItem(key)(),
        E.fromOption(() => notFoundError)
      )
    )
  );

/**
 * Sets an item in localStorage
 *
 * This is the LocalStorage interface method just exposed as an RTE
 */
export const setItem = (
  key: string,
  value: string
): RTE.ReaderTaskEither<LocalStorageModule, never, void> =>
  pipe(
    RTE.asks((m: LocalStorageModule) => m.localStorage),
    RTE.map((localStorage) => localStorage.setItem(key, value)())
  );

/**
 * Helper function for getting and decoding a JSON item from localStorage
 */
export const getAndDecodeItem = <A>(
  key: string,
  decode: (raw: unknown) => E.Either<t.Errors, A>
): RTE.ReaderTaskEither<LocalStorageModule, NotFoundError | DecodeError, A> =>
  pipe(getItem(key), RTE.map(JSON.parse), RTE.chainEitherKW(decode));

/**
 * Helper function for encoding and setting a JSON item in localStorage
 */
export const encodeAndSetItem = <A>(
  key: string,
  item: A,
  encode: (a: A) => unknown
): RTE.ReaderTaskEither<LocalStorageModule, never, void> =>
  pipe(encode(item), JSON.stringify, (value) => setItem(key, value));
