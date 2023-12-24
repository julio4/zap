/* To represent the user data context, such as his tokens, nfts, etc. */

import React, { createContext, useState } from "react";
import { TokenBalance } from "../../types";

type UserDataContextType = {
  tokenBalancesEthereum: TokenBalance[];
  tokenBalancesPolygon: TokenBalance[];
  setTokenBalances: (tokenBalancesEthereum: TokenBalance[], tokenBalancesPolygon: TokenBalance[]) => void;
};

const defaultUserDataContext: UserDataContextType = {
  tokenBalancesEthereum: [],
  tokenBalancesPolygon: [],
  setTokenBalances: () => {},
};

const UserDataContext = createContext<UserDataContextType>(defaultUserDataContext);

const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenBalancesEthereum, setTokenBalancesEthereum] = useState<TokenBalance[]>([]);
  const [tokenBalancesPolygon, setTokenBalancesPolygon] = useState<TokenBalance[]>([]);

  const setTokenBalances = (newTokenBalancesEthereum: TokenBalance[], newTokenBalancesPolygon: TokenBalance[]) => {
    setTokenBalancesEthereum(newTokenBalancesEthereum);
    setTokenBalancesPolygon(newTokenBalancesPolygon);
  };

  const contextValue = {
    tokenBalancesEthereum,
    tokenBalancesPolygon,
    setTokenBalances,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export { UserDataContext, UserDataProvider };