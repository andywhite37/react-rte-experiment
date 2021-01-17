import {fetchHttpClient} from "./http/FetchHttpClient";
import {HttpClientEnv} from "./http/HttpClient";
import {domLocalStorage} from "./localStorage/DomLocalStorage";
import {LocalStorageEnv} from "./localStorage/LocalStorage";

export const httpClientEnv: HttpClientEnv = {
  httpClient: fetchHttpClient,
};

export const localStorageEnv: LocalStorageEnv = {
  localStorage: domLocalStorage,
};

export type AppEnv = HttpClientEnv & LocalStorageEnv;

export const appEnv: AppEnv = {...httpClientEnv, ...localStorageEnv};
