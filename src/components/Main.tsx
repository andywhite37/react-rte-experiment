import React, { useReducer, useState } from "react";
import {
  appEnv,
  breedServiceEnv,
  cacheServiceEnv,
  httpClientEnv,
} from "../AppEnv";
import {
  AppEnvContext,
  useAppEnvReducer,
  useAppEnvRemoteData,
  useAppEnvRT,
  useAppEnvRTE,
} from "../hooks/useAppEnv";
import { BreedServiceContext, useBreedsRD } from "../hooks/useDomain";
import { useIO } from "../hooks/useIO";
import { Breed } from "../model/Breed";
import {
  BreedService,
  getBreeds,
  getBreedsWithCache,
} from "../service/domain/DogService";
import { HttpJsonError } from "../service/http/HttpError";
import { E, Eq, pipe, RD, RT, RTE, TE } from "../util/fpts";
import { Breeds } from "./Breeds";

////////////////////////////////////////////////////////////////////////////////
// Vanillaish implementation
////////////////////////////////////////////////////////////////////////////////

export const MainRTEWithGlobalDeps = () => {
  const [remoteData, setRemoteData] = useState<
    RD.RemoteData<HttpJsonError, Array<Breed>>
  >(RD.initial);

  useIO(
    () => {
      setRemoteData(RD.pending);
      RTE.run(getBreedsWithCache, {
        // Not great b/c we are importing global static deps - hard to test/mock/reuse
        ...httpClientEnv,
        ...cacheServiceEnv,
      }).then(
        E.fold(
          (e) => setRemoteData(RD.failure(e)),
          (b) => setRemoteData(RD.success(b))
        )
      );
    },
    [],
    Eq.getTupleEq()
  );

  return <Breeds breedsRD={remoteData} />;
};

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

  // Not great b/c we are dependent on the entire AppEnv, and the logic here is a little "low-level"
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

  // A littler simpler logic, but still depend on entire AppEnv
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
  // Simpler, still depends on AppEnv
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

// Redux/reducer code
type LoadingBreeds = { type: "loadingBreeds" };
type FailedBreeds = { type: "failedBreeds"; error: HttpJsonError };
type LoadedBreeds = { type: "loadedBreeds"; breeds: Array<Breed> };

type Action = LoadingBreeds | FailedBreeds | LoadedBreeds;

type State = { breedsRD: RD.RemoteData<HttpJsonError, Array<Breed>> };

const initialState = { breedsRD: RD.initial };

type Reducer = (state: State, action: Action) => State;

const reducer: Reducer = (_state, action) => {
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

  // Demo for dispatching actions (still depends on AppEnv)
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
// BreedService implementation
////////////////////////////////////////////////////////////////////////////////

const mockBreedService: BreedService<never> = {
  getBreeds: TE.right([
    { name: "breed1", subBreeds: ["sub1", "sub2"] },
    { name: "breed2", subBreeds: ["sub3", "sub4"] },
  ]),
};

export const MainBreedService = () => {
  const breedsRD = useBreedsRD();

  return <Breeds breedsRD={breedsRD} />;
};

////////////////////////////////////////////////////////////////////////////////
// Show a particular implementation
////////////////////////////////////////////////////////////////////////////////

export const Main = () => {
  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with ReaderTask-based hook
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<AppEnvContext.Provider value={appEnv}>
  //<MainAppEnvRT />
  //</AppEnvContext.Provider>
  //);

  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with ReaderTask-based hook
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<AppEnvContext.Provider value={appEnv}>
  //<MainAppEnvRTE />
  //</AppEnvContext.Provider>
  //);

  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with RemoteData-based hook
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<AppEnvContext.Provider value={appEnv}>
  //<MainAppEnvRemoteData />
  //</AppEnvContext.Provider>
  //);

  ///////////////////////////////////////////////////////////////////////////////
  // AppEnv context with reducer-based hook
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<AppEnvContext.Provider value={appEnv}>
  //<MainAppEnvReducer />
  //</AppEnvContext.Provider>
  //);

  ///////////////////////////////////////////////////////////////////////////////
  // BreedService context with real API
  ///////////////////////////////////////////////////////////////////////////////

  return (
    <BreedServiceContext.Provider value={breedServiceEnv}>
      <MainBreedService />
    </BreedServiceContext.Provider>
  );

  ///////////////////////////////////////////////////////////////////////////////
  // BreedService context with mock data
  ///////////////////////////////////////////////////////////////////////////////

  //return (
  //<BreedServiceContext.Provider value={{ breedService: mockBreedService }}>
  //<MainBreedService />
  //</BreedServiceContext.Provider>
  //);
};
