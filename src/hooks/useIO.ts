import { useEffect } from "react";
import { Eq, IO } from "../util/fpts";
import { useStable } from "./useStable";

export const useIO = <T extends Array<unknown>>(
  io: IO.IO<void>,
  dependencies: T,
  eq: Eq.Eq<T>
) => {
  const deps = useStable(dependencies, eq);
  useEffect(() => {
    io();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
