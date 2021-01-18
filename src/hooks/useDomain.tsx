import React, { useContext, useState } from "react";
import { breedServiceEnv } from "../AppEnv";
import { Breed } from "../model/Breed";
import { HttpJsonError } from "../service/http/HttpError";
import { E, Eq, RD } from "../util/fpts";
import { useIO } from "./useIO";

export const BreedServiceContext = React.createContext(breedServiceEnv);

export const useBreedService = () => {
  return useContext(BreedServiceContext);
};

export const useBreedsRD = () => {
  const breedServiceEnv = useBreedService();

  const [remoteData, setRemoteData] = useState<
    RD.RemoteData<HttpJsonError, Array<Breed>>
  >(RD.initial);

  useIO(
    () => {
      setRemoteData(RD.pending);
      breedServiceEnv.breedService.getBreeds().then(
        E.fold(
          (error) => setRemoteData(RD.failure(error)),
          (breeds) => setRemoteData(RD.success(breeds))
        )
      );
    },
    [],
    Eq.getTupleEq()
  );

  return remoteData;
};
