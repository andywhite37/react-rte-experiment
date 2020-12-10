import { pipe } from "fp-ts/lib/function";
import React, { useState } from "react";
import { appEnv } from "./AppEnv";
import { RD } from "./fp-ts-exports";
import { useReaderTaskEither } from "./hooks/useReaderTaskEither";
import { Dog } from "./model/Dog";
import { getDogsWithCache, getDogWithCache } from "./model/DogService";

export const App = () => {
  const [dogsRD, setDogsRD] = useState<
    RD.RemoteData<{ error: string }, Array<Dog>>
  >(() => RD.initial);

  // TODO: not sure about all this, just experimenting
  // This is basically just a helper for running an RTE with the env and supporting callbacks for handling different steps
  useReaderTaskEither({
    rte: getDogsWithCache, // RTE with no params
    rteEnv: appEnv, // Could stub in a dummy AppEnv here (or whatever mix of dummy & real stuff you want)
    effectDeps: [], // TODO
    eqEffectDeps: { equals: () => true }, // TODO
    // If using redux, you could use these to dispatch actions for updating redux state
    onBeforeEffect: () => setDogsRD(RD.pending),
    onError: (_) => setDogsRD(RD.failure({ error: "Failed to get dogs" })), // TODO: not really handling the errors here, but we could
    onSuccess: (dogs) => setDogsRD(RD.success(dogs)),
  });

  // RTE with parameters works the same way
  const [dogRD, setDogRD] = useState<RD.RemoteData<{ error: string }, Dog>>(
    () => RD.initial
  );

  useReaderTaskEither({
    rte: getDogWithCache("wolfhound"),
    rteEnv: appEnv, // Could stub in a dummy AppEnv here (or whatever mix of dummy & real stuff you want)
    effectDeps: [], // TODO
    eqEffectDeps: { equals: () => true }, // TODO
    // If using redux, you could use these to dispatch actions for updating redux state
    onBeforeEffect: () => setDogRD(RD.pending),
    onError: (_) => setDogRD(RD.failure({ error: "Failed to get dog" })), // TODO: not really handling the errors here, but we could
    onSuccess: (dog) => setDogRD(RD.success(dog)),
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
      {pipe(
        dogRD,
        RD.fold(
          () => <>Loading...</>,
          () => <>Loading...</>,
          (error) => <div>{error.error}</div>,
          (dogs) => <div>Got the dog</div>
        )
      )}
    </>
  );
};
