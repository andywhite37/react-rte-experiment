import React from "react";
import { appEnv, AppEnvContext } from "./AppEnv";
import { Main } from "./components/Main";

export const App = () => {
  return (
    <AppEnvContext.Provider value={appEnv}>
      <Main />
    </AppEnvContext.Provider>
  );
};
