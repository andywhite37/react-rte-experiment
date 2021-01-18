import { useState } from "react";
import { AppEnv } from "../AppEnv";
import { E, Eq, pipe, RD, RT, RTE } from "../util/fpts";
import { useAppRTE } from "./useAppRTE";

export const useAppRTEData = <E, A, Deps extends Array<unknown>>({
  rte,
  deps,
  eqDeps,
}: {
  rte: RTE.ReaderTaskEither<AppEnv, E, A>;
  deps: Deps;
  eqDeps: Eq.Eq<Deps>;
}): RD.RemoteData<E, A> => {
  const [remoteData, setRemoteData] = useState<RD.RemoteData<E, A>>(
    () => RD.initial
  );

  const rte_ = pipe(
    // Update the RD to pending
    RTE.fromIO<AppEnv, never, void>(() => {
      setRemoteData(RD.pending);
    }),
    // Run the user's RTE
    RTE.chain((_) => rte),
    // Fold the RTE into a ReaderTask<void> where both the success and failure channels
    // are converted into an IO that updates the RemoteData state
    RTE.fold<AppEnv, E, A, void>(
      (e) =>
        RT.fromIO(() => {
          setRemoteData(RD.failure(e));
        }),
      (a) =>
        RT.fromIO(() => {
          setRemoteData(RD.success(a));
        })
    ),
    // Lift the ReaderTask<R, void> into ReaderTaskEither<R, never, void> for simplicity
    // and so we can use it use the useAppRTE hook
    RT.map(E.right) // TODO: better way to handle this
  );

  useAppRTE({
    rte: rte_,
    deps,
    eqDeps,
  });

  return remoteData;
};
