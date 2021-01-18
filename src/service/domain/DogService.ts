import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import { Breed, breedCodec } from "../../model/Breed";
import { Image, imageCodec } from "../../model/Image";
import { decodeWithCodec } from "../../util/decode";
import { A, R, Rec, RTE, TE } from "../../util/fpts";
import { CacheServiceEnv, getWithCache } from "../cache/CacheService";
import { getJson, HttpClientEnv } from "../http/HttpClient";
import { HttpJsonError } from "../http/HttpError";

////////////////////////////////////////////////////////////////////////////////
// Implementations of the services
////////////////////////////////////////////////////////////////////////////////

type GetBreedsResponse = {
  message: Record<string, Array<string>>;
};

const getBreedsResponseCodec: t.Type<GetBreedsResponse> = t.type({
  message: t.record(t.string, t.array(t.string)),
});

export const getBreeds: RTE.ReaderTaskEither<
  HttpClientEnv,
  HttpJsonError,
  Array<Breed>
> = pipe(
  getJson(
    "https://dog.ceo/api/breeds/list/all",
    decodeWithCodec(getBreedsResponseCodec)
  ),
  RTE.map((response) =>
    pipe(
      Rec.toArray(response.message),
      A.map(([name, subBreeds]) => ({ name, subBreeds }))
    )
  )
);

type GetBreedImagesResponse = {
  message: Array<string>;
};

const getBreedImagesResponseCodec: t.Type<GetBreedImagesResponse> = t.type({
  message: t.array(t.string),
});

export const getBreedImages = (
  breed: Breed
): RTE.ReaderTaskEither<HttpClientEnv, HttpJsonError, Array<Image>> =>
  pipe(
    getJson(
      `https://dog.ceo/api/breed/${breed.name}/images`,
      decodeWithCodec(getBreedImagesResponseCodec)
    ),
    RTE.map((response) =>
      pipe(
        response.message,
        A.map((url) => ({ url }))
      )
    )
  );

export const getBreedsWithCache: RTE.ReaderTaskEither<
  HttpClientEnv & CacheServiceEnv,
  HttpJsonError,
  Array<Breed>
> = getWithCache("breeds", t.array(breedCodec), getBreeds);

export const getBreedImagesWithCache = (
  breed: Breed
): RTE.ReaderTaskEither<
  HttpClientEnv & CacheServiceEnv,
  HttpJsonError,
  Array<Image>
> =>
  getWithCache(
    `breedImages-${breed.name}`,
    t.array(imageCodec),
    getBreedImages(breed)
  );

////////////////////////////////////////////////////////////////////////////////
// Domain services to get breeds, etc.
//
// These should not expose lower-level dependencies, and should keep the error type
// abstract.
////////////////////////////////////////////////////////////////////////////////

export interface BreedService<E> {
  getBreeds: TE.TaskEither<E, Array<Breed>>;
}

export type BreedServiceEnv<E> = {
  breedService: BreedService<E>;
};

export interface BreedImageService<E> {
  getBreedImages: (breed: Breed) => TE.TaskEither<E, Array<Image>>;
}

export type BreedImageServiceEnv<E> = {
  breedImageService: BreedImageService<E>;
};

////////////////////////////////////////////////////////////////////////////////
// Service implementations
////////////////////////////////////////////////////////////////////////////////

export const makeBreedService: R.Reader<
  HttpClientEnv & CacheServiceEnv,
  BreedService<HttpJsonError>
> = (env) => ({
  getBreeds: getBreedsWithCache(env),
});

/**
 * Reader that takes the required env, and produces an implementation of the GetBreedImagesService
 */
export const makeBreedImageService: R.Reader<
  HttpClientEnv,
  BreedImageService<HttpJsonError>
> = (env) => ({
  getBreedImages: (breed) => getBreedImages(breed)(env),
});
