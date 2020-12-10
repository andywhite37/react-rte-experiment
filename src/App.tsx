import { pipe } from "fp-ts/lib/function";
import React, { useState } from "react";
import { appEnv } from "./AppEnv";
import { RD } from "./fp-ts-exports";
import { useAppEnv } from "./hooks/useAppEnv";
import { Dog } from "./model/Dog";
import { getDogsWithCache } from "./model/DogService";

export const App = () => {
  const [dogsRD, setDogsRD] = useState<
    RD.RemoteData<{ error: string }, Array<Dog>>
  >(() => RD.initial);

  // TODO: not sure about all this, just experimenting
  useAppEnv({
    rte: getDogsWithCache,
    rteEnv: appEnv,
    effectDeps: [],
    // If using redux, you could use these to dispatch actions for updating redux state
    onBeforeEffect: () => setDogsRD(RD.pending),
    onError: (_error) => setDogsRD(RD.failure({ error: "Failed to get dogs" })),
    onSuccess: (dogs) => setDogsRD(RD.success(dogs)),
  });

  return (
    <>
      {pipe(
        dogsRD,
        RD.fold(
          () => <>Loading...</>,
          () => <>Loading...</>,
          (error) => <div>{error.error}</div>,
          (dogs) => <div>Got the dogs</div>
        )
      )}
    </>
  );
};
