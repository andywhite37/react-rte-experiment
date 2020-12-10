import { pipe } from "fp-ts/lib/pipeable";
import { useEffect } from "react";
import { E, Eq, RTE } from "../fp-ts-exports";

// TODO: not sure how best to do this... just toying
export const useReaderTaskEither = <
  R,
  E,
  A,
  EffectDeps extends Array<unknown>
>({
  rte,
  rteEnv,
  effectDeps,
  eqEffectDeps,
  onBeforeEffect,
  onError,
  onSuccess,
  onFinally,
}: {
  rte: RTE.ReaderTaskEither<R, E, A>;
  rteEnv: R;
  effectDeps: EffectDeps;
  eqEffectDeps: Eq.Eq<EffectDeps>;
  onBeforeEffect?: () => void;
  onError: (e: E) => void;
  onSuccess: (a: A) => void;
  onFinally?: () => void;
}) => {
  // TODO: the eqEffectDeps is not currently used

  useEffect(() => {
    // 1. Invoke before effect callback
    if (onBeforeEffect !== undefined) onBeforeEffect();

    // 1. Apply the AppEnv to get the TaskEither (note: here is where you could stub in mock dependencies if you wanted to
    // 2. Start the Promise by calling the TaskEither
    // 3. Handle the results of the Promise with callbacks
    rte(rteEnv)()
      .then((either) => pipe(either, E.fold(onError, onSuccess)))
      .finally(onFinally);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, effectDeps);
};