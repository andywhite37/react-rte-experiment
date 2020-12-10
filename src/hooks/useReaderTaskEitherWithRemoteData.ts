import { useState } from "react";
import { Eq, RD, RTE } from "../fp-ts-exports";
import { useReaderTaskEither } from "./useReaderTaskEither";

export const useReaderTaskEitherWithRemoteData = <
  R,
  E,
  A,
  EffectDeps extends Array<unknown>
>({
  rte,
  rteEnv,
  effectDeps,
  eqEffectDeps,
}: {
  rte: RTE.ReaderTaskEither<R, E, A>;
  rteEnv: R;
  effectDeps: EffectDeps;
  eqEffectDeps: Eq.Eq<EffectDeps>;
}) => {
  const [remoteData, setRemoteData] = useState<RD.RemoteData<E, A>>(
    () => RD.initial
  );

  useReaderTaskEither({
    rte,
    rteEnv,
    effectDeps,
    eqEffectDeps,
    onBeforeEffect: () => setRemoteData(RD.pending),
    onError: (error) => setRemoteData(RD.failure(error)),
    onSuccess: (data) => setRemoteData(RD.success(data)),
  });

  return remoteData;
};
