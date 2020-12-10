import { O } from "../fp-ts-exports";
import { LocalStorage } from "./LocalStorage";

/**
 * Implementation of LocalStorage using the DOM API
 */
export const domLocalStorage: LocalStorage = {
  getItem: (key: string) => () => O.fromNullable(localStorage.getItem(key)),

  setItem: (key: string, value: string) => () =>
    localStorage.setItem(key, value),

  removeItem: (key: string) => () => localStorage.removeItem(key),

  clear: () => localStorage.clear(),

  size: () => localStorage.length,
};
