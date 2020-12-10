import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { DecodeError, NotFoundError } from "../AppErrors";
import { RTE } from "../fp-ts-exports";
import { HttpClientModule, sendBasicGetRequest } from "../http/HttpClient";
import {
  HttpContentTypeError,
  HttpRequestError,
  HttpResponseStatusError,
} from "../http/HttpError";
import {
  encodeAndSetItem,
  getAndDecodeItem,
  LocalStorageModule,
} from "../localStorage/LocalStorage";
import { Dog, dogType } from "./Dog";

/**
 * Gets the dogs via the HTTP API
 */
export const getDogs: RTE.ReaderTaskEither<
  HttpClientModule,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | DecodeError,
  Array<Dog>
> = sendBasicGetRequest("/dogs", t.array(dogType).decode);

/**
 * Utilizes the HttpClient and LocalStorage modules to get Dog data from the cache, or via the API
 *
 * TODO: could abstract this type of pattern
 */
export const getDogsWithCache: RTE.ReaderTaskEither<
  HttpClientModule & LocalStorageModule,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | NotFoundError
  | DecodeError,
  Array<Dog>
> = pipe(
  // Check the cache first
  getAndDecodeItem("dogs", t.array(dogType).decode),
  // TODO: RTE.tap
  RTE.map((dogs) => {
    console.log("cache hit for dogs");
    return dogs;
  }),
  // If cache is empty, run the fetch and then cache the response
  RTE.altW(() => {
    console.log("cache miss for dogs");
    return pipe(
      // GET the data
      getDogs,
      RTE.chainW((dogs) =>
        pipe(
          // Store it in local storage
          encodeAndSetItem("dogs", dogs, t.array(dogType).encode),
          // Return the data now
          RTE.map((_) => dogs)
        )
      )
    );
  })
);

/**
 * Gets a dog via the HTTP API
 */
export const getDog = (
  dogId: string
): RTE.ReaderTaskEither<
  HttpClientModule,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | DecodeError,
  Dog
> => sendBasicGetRequest(`/dogs/${dogId}`, dogType.decode);

/**
 * Utilizes the HttpClient and LocalStorage modules to get Dog data from the cache, or via the API
 */
export const getDogWithCache = (
  dogId: string
): RTE.ReaderTaskEither<
  HttpClientModule & LocalStorageModule,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | NotFoundError
  | DecodeError,
  Dog
> =>
  pipe(
    // Check the cache first
    getAndDecodeItem(`dog-${dogId}`, dogType.decode),
    // TODO: RTE.tap
    RTE.map((dog) => {
      console.log(`cache hit for dog ${dogId}`);
      return dog;
    }),
    // If cache is empty, run the fetch and then cache the response
    RTE.altW(() => {
      console.log(`cache miss for dog ${dogId}`);
      return pipe(
        // GET the data
        getDog(dogId),
        RTE.chainW((dog) =>
          pipe(
            // Store it in local storage
            encodeAndSetItem(`dog-${dogId}`, dog, dogType.encode),
            // Return the data now
            RTE.map((_) => dog)
          )
        )
      );
    })
  );
