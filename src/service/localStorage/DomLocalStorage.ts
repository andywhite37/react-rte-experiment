import { O } from "../../util/fpts";
import { LocalStorage } from "./LocalStorage";

export const domLocalStorage: LocalStorage = {
  getItem: (key: string) => () => O.fromNullable(localStorage.getItem(key)),

  setItem: (key: string, value: string) => () =>
    localStorage.setItem(key, value),

  removeItem: (key: string) => () => localStorage.removeItem(key),

  clear: () => localStorage.clear(),

  size: () => localStorage.length,
};
