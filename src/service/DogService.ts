import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { A, O, R, Rec, RTE, TE } from "../fp-ts-exports";
import { HttpClientEnv, sendBasicGetRequest } from "../http/HttpClient";
import {
  HttpContentTypeError,
  HttpRequestError,
  HttpResponseStatusError,
} from "../http/HttpError";
import {
  getItemWithDecode,
  LocalStorageEnv,
  setItemWithEncode,
} from "../localStorage/LocalStorage";
import { Breed, breedType } from "../model/Breed";
import { DecodeError, decodeWithType } from "../util/decode";

export type GetBreedsResponse = {
  message: Record<string, Array<string>>;
};

export const getBreedsResponseCodec: t.Type<GetBreedsResponse> = t.type({
  message: t.record(t.string, t.array(t.string)),
});

/**
 * Gets the breeds via the HTTP API
 */
export const getBreeds: RTE.ReaderTaskEither<
  HttpClientEnv,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | DecodeError,
  Array<Breed>
> = pipe(
  sendBasicGetRequest(
    "https://dog.ceo/api/breeds/list/all",
    decodeWithType(getBreedsResponseCodec)
  ),
  RTE.map((response) =>
    pipe(
      Rec.toArray(response.message),
      A.map(([name, subBreeds]) => ({ name, subBreeds }))
    )
  )
);

/**
 * Utilizes the HttpClient and LocalStorage modules to get Dog data from the cache, or via the API
 *
 * TODO: could abstract this type of pattern
 */
export const getBreedsWithCache: RTE.ReaderTaskEither<
  HttpClientEnv & LocalStorageEnv,
  | HttpRequestError
  | HttpResponseStatusError
  | HttpContentTypeError<"json">
  | DecodeError,
  Array<Breed>
> = pipe(
  // Try to get from the localStorage cache
  getItemWithDecode("breeds", decodeWithType(t.array(breedType))),
  RTE.chainW((breedsOpt) =>
    pipe(
      breedsOpt,
      O.fold(
        // Cache miss - do the API call, and store the results in the cache
        () =>
          pipe(
            // API call
            getBreeds,
            RTE.chainW((breeds) =>
              pipe(
                // Store the results as a side-effect
                setItemWithEncode("breeds", breeds, t.array(breedType).encode),
                // Return the results
                RTE.map((_) => breeds)
              )
            )
          ),
        RTE.right
      )
    )
  )
);

////////////////////////////////////////////////////////////////////////////////
// The domain-level interfaces that hide the dependencies
//
// Application-level components should depend on these interfaces, and the
// "composition root" should partially apply the dependencies needed for the
// implementation
////////////////////////////////////////////////////////////////////////////////

/**
 * The domain-level service to get the list of Breeds
 */
export interface GetBreedsService {
  getBreeds: TE.TaskEither<
    | HttpRequestError
    | HttpResponseStatusError
    | HttpContentTypeError<"json">
    | DecodeError,
    Array<Breed>
  >;
}

/**
 * A basic Reader that allows us to specify the dependencies for a particular implementation
 * of the GetBreedsService API
 */
export const getBreedsServiceR: R.Reader<
  HttpClientEnv & LocalStorageEnv,
  GetBreedsService
> = pipe(
  R.ask<HttpClientEnv & LocalStorageEnv>(),
  R.map((env) => ({
    getBreeds: getBreedsWithCache(env),
  }))
);

export interface GetBreedImagesService {
  getBreedImages: (
    breed: Breed
  ) => TE.TaskEither<
    | HttpRequestError
    | HttpContentTypeError<"json">
    | HttpResponseStatusError
    | DecodeError,
    Array<string>
  >;
}
