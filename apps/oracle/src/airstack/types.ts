export type AirstackTokenBalance = {
  TokenBalance: {
    formattedAmount: number;
  } | null;
};

export type AirstackPoapHolder = {
  Poaps: {
    Poap: {
      owner: {
        identity: string;
      };
    };
  } | null;
};

export type AirstackNftHolderPolygon = {
  polygon: {
    TokenBalance: {
      owner: {
        identity: string;
      }[];
    } | null;
  };
};

export type AirstackNftHolderETH = {
  ethereum: {
    TokenBalance: {
      owner: {
        identity: string;
      }[];
    } | null;
  };
};

export type AirstackResponse<T> = {
  data: T;
};
