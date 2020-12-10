import { fetchHttpClient } from "./http/FetchHttpClient";
import { HttpClientModule } from "./http/HttpClient";
import { domLocalStorage } from "./localStorage/DomLocalStorage";
import { LocalStorageModule } from "./localStorage/LocalStorage";

export const httpClientModule: HttpClientModule = {
  httpClient: fetchHttpClient,
};

export const localStorageModule: LocalStorageModule = {
  localStorage: domLocalStorage,
};

export type AppEnv = HttpClientModule & LocalStorageModule;

export const appEnv: AppEnv = { ...httpClientModule, ...localStorageModule };
