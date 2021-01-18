import { useRef } from "react";
import { Eq } from "../util/fpts";

export const useStable = <A>(a: A, eqA: Eq.Eq<A>) => {
  const refA = useRef<A>(a);
  if (!eqA.equals(a, refA.current)) {
    refA.current = a;
  }
  return refA.current;
};
