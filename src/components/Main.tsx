import React from "react";
import { useAppRTEData } from "../hooks/useAppRTEData";
import { getBreeds } from "../service/domain/DogService";
import { Eq, pipe, RD, RTE } from "../util/fpts";

export const Main = () => {
  //const appEnv = useAppEnv()

  const breedsRD = useAppRTEData({
    rte: pipe(
      getBreeds,
      RTE.mapLeft((e) => {
        switch (e.tag) {
          case "httpRequestError":
            return { message: "Failed to connect to server" };
          case "httpContentTypeError":
            return { message: "Unexpected response from server" };
          case "httpResponseStatusError":
            return { message: `Request failed with status: ${e.status}` };
          case "decodeError":
            return { message: `Failed to decode response JSON` };
        }
      })
    ),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return (
    <>
      <h1>Breeds</h1>
      {pipe(
        breedsRD,
        RD.fold(
          () => <h1>Welcome</h1>,
          () => <h1>Loading...</h1>,
          (error) => <h1>Failed: {error.message}</h1>,
          (breeds) => (
            <ul>
              {breeds.map((breed) => (
                <li key={breed.name}>{breed.name}</li>
              ))}
            </ul>
          )
        )
      )}
    </>
  );
};
