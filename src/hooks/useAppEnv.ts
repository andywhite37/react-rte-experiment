import React, { useContext } from "react";
import { useState } from "react";
import { appEnv, AppEnv } from "../AppEnv";
import { E, Eq, pipe, RD, RT, RTE } from "../util/fpts";
import { useIO } from "./useIO";

export const AppEnvContext = React.createContext(appEnv);

export const useAppEnv = () => {
  return useContext(AppEnvContext);
};

/**
 * Runs an ReaderTask using the global AppEnv. A ReaderTask is the same as a ReaderTaskEither
 * with the error type set to `never` - this is done to force the caller to explicitly handle the
 * all possible errors.
 */
export const useAppEnvRT = <Deps extends Array<unknown>>({
  rt,
  deps,
  eqDeps,
}: {
  rt: RT.ReaderTask<AppEnv, void>;
  deps: Deps;
  eqDeps: Eq.Eq<Deps>;
}) => {
  // This is the key to the RTE flexibility, but it comes at the cost of making any component
  // that uses this dependent on the whole AppEnv
  const env = useAppEnv();

  useIO(
    () => {
      RT.run(rt, env);
    },
    deps,
    eqDeps
  );
};

/**
 * Runs an RTE<AppEnv, E, A> and handles before, success, and failure using the given
 * callbacks. The callbacks cannot fail, and are run as IO<void> operations in the RTE chain.
 */
export const useAppEnvRTE = <E, A, Deps extends Array<unknown>>({
  rte,
  onBefore,
  onError,
  onSuccess,
  deps,
  eqDeps,
}: {
  rte: RTE.ReaderTaskEither<AppEnv, E, A>;
  // TODO: these could be made effectful (IO/RT/RTE/etc.) if desired
  onBefore: () => void;
  onError: (e: E) => void;
  onSuccess: (a: A) => void;
  deps: Deps;
  eqDeps: Eq.Eq<Deps>;
}): void => {
  const rt: RT.ReaderTask<AppEnv, void> = pipe(
    RTE.fromIO<AppEnv, never, void>(onBefore),
    RTE.chain((_) => rte),
    RTE.fold<AppEnv, E, A, void>(
      (e) =>
        RT.fromIO(() => {
          onError(e);
        }),
      (a) =>
        RT.fromIO(() => {
          onSuccess(a);
        })
    )
  );

  useAppEnvRT({
    rt,
    deps,
    eqDeps,
  });
};

/**
 * A hook to integrate an RTE with the dispatch of redux/reducer actions
 */
export const useAppEnvReducer = <E, A, Action, Deps extends Array<unknown>>({
  rte,
  getBeforeAction,
  getErrorAction,
  getSuccessAction,
  dispatch,
  deps,
  eqDeps,
}: {
  rte: RTE.ReaderTaskEither<AppEnv, E, A>;
  getBeforeAction: () => Action;
  getErrorAction: (e: E) => Action;
  getSuccessAction: (a: A) => Action;
  dispatch: (a: Action) => void;
  deps: Deps;
  eqDeps: Eq.Eq<Deps>;
}): void =>
  useAppEnvRTE({
    rte,
    onBefore: () => dispatch(getBeforeAction()),
    onSuccess: (a) => dispatch(getSuccessAction(a)),
    onError: (e) => dispatch(getErrorAction(e)),
    deps,
    eqDeps,
  });

/**
 * A hook to handle as RTE effect as a RemoteData state
 */
export const useAppEnvRemoteData = <E, A, Deps extends Array<unknown>>({
  rte,
  deps,
  eqDeps,
}: {
  rte: RTE.ReaderTaskEither<AppEnv, E, A>;
  deps: Deps;
  eqDeps: Eq.Eq<Deps>;
}): RD.RemoteData<E, A> => {
  const [remoteData, setRemoteData] = useState<RD.RemoteData<E, A>>(RD.initial);

  useAppEnvRTE({
    rte,
    onBefore: () => setRemoteData(RD.pending),
    onError: (e) => setRemoteData(RD.failure(e)),
    onSuccess: (a) => setRemoteData(RD.success(a)),
    deps,
    eqDeps,
  });

  return remoteData;
};
