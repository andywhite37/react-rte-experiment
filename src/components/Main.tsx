import React, { useReducer, useState } from "react";
import {
  useAppEnvReducer,
  useAppEnvRemoteData,
  useAppEnvRT,
  useAppEnvRTE,
} from "../hooks/useAppEnv";
import { Breed } from "../model/Breed";
import { getBreeds, getBreedsWithCache } from "../service/domain/DogService";
import { HttpJsonError } from "../service/http/HttpError";
import { Eq, pipe, RD, RT, RTE } from "../util/fpts";
import { Breeds } from "./Breeds";

////////////////////////////////////////////////////////////////////////////////
// Using lowest-level ReaderTask implementation
//
// This requires the caller to use an RTE, then explicitly map it into a
// ReaderTask<AppEnv, void> to indicate that errors are handled (`never`) and output
// is consumed (`void`).
////////////////////////////////////////////////////////////////////////////////

export const MainAppEnvRT = () => {
  const [breedsRD, setBreedsRD] = useState<
    RD.RemoteData<HttpJsonError, Array<Breed>>
  >(RD.initial);

  useAppEnvRT({
    rt: pipe(
      getBreeds,
      RTE.fold(
        (e: HttpJsonError) =>
          RT.fromIO(() => {
            setBreedsRD(RD.failure(e));
          }),
        (breeds: Array<Breed>) =>
          RT.fromIO(() => {
            setBreedsRD(RD.success(breeds));
          })
      )
    ),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <Breeds breedsRD={breedsRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using an RTE with before/success/error callbacks
//
// This is a helpers to ease the explicit handling of before/error/success
////////////////////////////////////////////////////////////////////////////////

export const MainAppEnvRTE = () => {
  const [breedsRD, setBreedsRD] = useState<
    RD.RemoteData<HttpJsonError, Array<Breed>>
  >(RD.initial);

  useAppEnvRTE({
    rte: getBreeds,
    onBefore: () => setBreedsRD(RD.pending),
    onError: (error) => setBreedsRD(RD.failure(error)),
    onSuccess: (breeds) => setBreedsRD(RD.success(breeds)),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <Breeds breedsRD={breedsRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using an RTE that manifests itself as a RemoteData state
////////////////////////////////////////////////////////////////////////////////

export const MainAppEnvRemoteData = () => {
  const breedsRD = useAppEnvRemoteData({
    rte: getBreeds,
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <Breeds breedsRD={breedsRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Using an RTE that manifests itself as reducer/redux actions
////////////////////////////////////////////////////////////////////////////////

type LoadingBreeds = { type: "loadingBreeds" };
type FailedBreeds = { type: "failedBreeds"; error: HttpJsonError };
type LoadedBreeds = { type: "loadedBreeds"; breeds: Array<Breed> };

type Action = LoadingBreeds | FailedBreeds | LoadedBreeds;

type State = { breedsRD: RD.RemoteData<HttpJsonError, Array<Breed>> };

const initialState = { breedsRD: RD.initial };

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (state, action) => {
  switch (action.type) {
    case "loadingBreeds":
      return { breedsRD: RD.pending };
    case "failedBreeds":
      return { breedsRD: RD.failure(action.error) };
    case "loadedBreeds":
      return { breedsRD: RD.success(action.breeds) };
  }
};

export const MainAppEnvReducer = () => {
  const [state, dispatch] = useReducer<Reducer>(reducer, initialState);

  useAppEnvReducer({
    rte: getBreedsWithCache,
    dispatch,
    getBeforeAction: (): Action => ({ type: "loadingBreeds" }),
    getErrorAction: (error): Action => ({ type: "failedBreeds", error }),
    getSuccessAction: (breeds): Action => ({
      type: "loadedBreeds",
      breeds,
    }),
    deps: [],
    eqDeps: Eq.getTupleEq(),
  });

  return <Breeds breedsRD={state.breedsRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Show a particular implementation
////////////////////////////////////////////////////////////////////////////////
//
export const Main = () => {
  //return <MainAppEnvRT />;
  //return <MainAppEnvRTE />;
  //return <MainAppEnvRemoteData />;
  return <MainAppEnvReducer />;
};
