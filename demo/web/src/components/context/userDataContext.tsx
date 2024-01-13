/* To represent the user data context, such as his tokens, nfts, etc. */

import React, { createContext, useState } from "react";
import { TokenBalance, TokenNft } from "../../types";

type UserDataContextType = {
  tokenBalancesEthereum: TokenBalance[];
  tokenBalancesPolygon: TokenBalance[];
  NftBalancesEthereum: TokenNft[];
  NftBalancesPolygon: TokenNft[];
  setTokenBalances: (tokenBalancesEthereum: TokenBalance[], tokenBalancesPolygon: TokenBalance[]) => void;
  setNftBalances: (NftBalancesEthereum: TokenNft[], NftBalancesPolygon: TokenNft[]) => void;
};

const defaultUserDataContext: UserDataContextType = {
  tokenBalancesEthereum: [],
  tokenBalancesPolygon: [],
  NftBalancesEthereum: [],
  NftBalancesPolygon: [],
  setTokenBalances: () => {},
  setNftBalances: () => {},
};

const UserDataContext = createContext<UserDataContextType>(defaultUserDataContext);

const UserDataProvider = ({ children }: { children: React.ReactNode }) => {
  const [tokenBalancesEthereum, setTokenBalancesEthereum] = useState<TokenBalance[]>([]);
  const [tokenBalancesPolygon, setTokenBalancesPolygon] = useState<TokenBalance[]>([]);
  const [NftBalancesEthereum, setNftBalancesEthereum] = useState<TokenNft[]>([]);
  const [NftBalancesPolygon, setNftBalancesPolygon] = useState<TokenNft[]>([]);

  const setTokenBalances = (newTokenBalancesEthereum: TokenBalance[], newTokenBalancesPolygon: TokenBalance[]) => {
    setTokenBalancesEthereum(newTokenBalancesEthereum);
    setTokenBalancesPolygon(newTokenBalancesPolygon);
  };

  const setNftBalances = (newNftBalancesEthereum: TokenNft[], newNftBalancesPolygon: TokenNft[]) => {
    setNftBalancesEthereum(newNftBalancesEthereum);
    setNftBalancesPolygon(newNftBalancesPolygon);
  };

  const contextValue = {
    tokenBalancesEthereum,
    tokenBalancesPolygon,
    NftBalancesEthereum,
    NftBalancesPolygon,
    setNftBalances,
    setTokenBalances,
  };

  return (
    <UserDataContext.Provider value={contextValue}>
      {children}
    </UserDataContext.Provider>
  );
};

export { UserDataContext, UserDataProvider };