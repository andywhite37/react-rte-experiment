import { AppEnv, useAppEnv } from "../AppEnv";
import { Eq, RTE } from "../util/fpts";
import { useIO } from "./useIO";

export const useAppRTE = <Deps extends Array<unknown>>({
  rte,
  deps,
  eqDeps,
}: {
  // By making E=never, and A=void, we are forcing the caller to handle the errors
  // explicitly, and forcing them to make sure the value is consumed, so they don't accidentally
  // have the RTE produce a value that just goes into the void.
  // TODO: This is ReaderTask<AppEnv, void>, but keep it RTE for simplicity
  rte: RTE.ReaderTaskEither<AppEnv, never, void>;
  deps: Deps;
  eqDeps: Eq.Eq<Deps>;
}) => {
  const env = useAppEnv();
  useIO(
    () => {
      RTE.run(rte, env);
    },
    deps,
    eqDeps
  );
};
