import {pipe} from "fp-ts/lib/pipeable";
import {E, IO, O, RTE} from "../fp-ts-exports";

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
export interface LocalStorageEnv {
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
): RTE.ReaderTaskEither<LocalStorageEnv, never, O.Option<string>> =>
  pipe(
    RTE.asks((m: LocalStorageEnv) => m.localStorage),
    RTE.chain((localStorage) =>
      RTE.fromIO(localStorage.getItem(key))
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
): RTE.ReaderTaskEither<LocalStorageEnv, never, void> =>
  pipe(
    RTE.asks((m: LocalStorageEnv) => m.localStorage),
    RTE.chain((localStorage) => RTE.fromIO(localStorage.setItem(key, value)))
  );

/**
 * Helper function for getting and decoding a JSON item from localStorage
 */
export const getItemWithDecode = <E, A>(
  key: string,
  decode: (raw: unknown) => E.Either<E, A>
): RTE.ReaderTaskEither<LocalStorageEnv, E, O.Option<A>> =>
  pipe(
    getItem(key),
    RTE.chainEitherKW(itemStringOpt => pipe(itemStringOpt, O.fold(
      (): E.Either<E, O.Option<A>> => E.right(O.none),
      itemString => pipe(
        itemString,
        JSON.stringify,
        decode,
        E.map(O.some)
      )
    ))))

/**
 * Helper function for encoding and setting a JSON item in localStorage
 */
export const setItemWithEncode = <A>(
  key: string,
  item: A,
  encode: (a: A) => unknown
): RTE.ReaderTaskEither<LocalStorageEnv, never, void> =>
  pipe(encode(item), JSON.stringify, (value) => setItem(key, value));
