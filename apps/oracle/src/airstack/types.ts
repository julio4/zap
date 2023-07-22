export type AirstackTokenBalance = {
  TokenBalance: {
    formattedAmount: number;
  } | null;
};

export type AirstackPoapHolder = {
  Poaps: {
    Poap:
      | {
          owner: {
            identity: string;
          };
        }[]
      | null;
  };
};

export type AirstackNftHolder = {
  TokenBalances: {
    TokenBalance:
      | {
          owner: {
            addresses: string[];
          };
        }[]
      | null;
  };
};

export type AirstackResponse<T> = {
  data: T;
};
