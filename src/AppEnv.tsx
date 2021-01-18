import React, { useContext } from "react";
import { fetchHttpClient } from "./service/http/FetchHttpClient";
import { HttpClient, HttpClientEnv } from "./service/http/HttpClient";
import { HttpJsonError } from "./service/http/HttpError";
import { domLocalStorage } from "./service/localStorage/DomLocalStorage";
import {
  LocalStorage,
  LocalStorageEnv,
} from "./service/localStorage/LocalStorage";
import {
  CacheService,
  CacheServiceEnv,
  makeLocalStorageCacheService,
} from "./service/cache/CacheService";
import {
  BreedImageService,
  BreedImageServiceEnv,
  makeBreedImageService,
  BreedService,
  BreedServiceEnv,
  makeBreedService,
} from "./service/domain/DogService";

////////////////////////////////////////////////////////////////////////////////
// Instantiate the implementations of our services services
////////////////////////////////////////////////////////////////////////////////

const httpClient: HttpClient = fetchHttpClient;

export const httpClientEnv: HttpClientEnv = {
  httpClient,
};

const localStorage: LocalStorage = domLocalStorage;

export const localStorageEnv: LocalStorageEnv = {
  localStorage,
};

export const cacheService: CacheService = makeLocalStorageCacheService(
  localStorageEnv
);

export const cacheServiceEnv: CacheServiceEnv = {
  cacheService,
};

export const breedService: BreedService<HttpJsonError> = makeBreedService({
  ...httpClientEnv,
  ...cacheServiceEnv,
});

export const breedServiceEnv: BreedServiceEnv<HttpJsonError> = {
  breedService,
};

export const breedImageService: BreedImageService<HttpJsonError> = makeBreedImageService(
  { ...httpClientEnv, ...localStorageEnv }
);

export const breedImageServiceEnv: BreedImageServiceEnv<HttpJsonError> = {
  breedImageService,
};

export type AppEnv = HttpClientEnv &
  LocalStorageEnv &
  CacheServiceEnv &
  BreedServiceEnv<HttpJsonError> &
  BreedImageServiceEnv<HttpJsonError>;

export const appEnv: AppEnv = {
  ...httpClientEnv,
  ...localStorageEnv,
  ...cacheServiceEnv,
  ...breedServiceEnv,
  ...breedImageServiceEnv,
};

////////////////////////////////////////////////////////////////////////////////
// Infrastructure service context providers and hooks
////////////////////////////////////////////////////////////////////////////////

export const AppEnvContext = React.createContext(appEnv);

// TODO: not sure how best to do this
// I want the caller to be able to say which parts of the Env they want, so they don't have to
// over-depend on the entire AppEnv
export const useAppEnv = () => {
  return useContext(AppEnvContext);
};
