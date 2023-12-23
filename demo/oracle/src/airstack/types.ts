export type TokenBalancesResponse = {
  TokenBalances: {
    TokenBalance: TokenBalance[];
  };
};

export type TokenBalance = {
  tokenAddress: string;
  formattedAmount: number;
  token: {
    id: string;
    isSpam: boolean;
    logo: Logo | null;
    name: string;
  };
};

export type Logo = {
  small: string | null;
};

export type AirstackTokenBalance = {
  TokenBalances: {
    TokenBalance: Array<{
      token: {
        id: string;
      };
      formattedAmount: number;
    }>;
  };
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

type XmtpData = {
  isXMTPEnabled: boolean;
};

export type AirstackXmtpEnabled = {
  Wallet: {
    xmtp: XmtpData[] | null;
  };
};

export type AirstackEnsHolder = {
  Wallet: {
    domains:
      | {
          name: string;
        }[]
      | null;
  };
};

export type AirstackSocialsHolder = {
  Wallet: {
    socials:
      | {
          dappName: string;
          profileName: string;
        }[]
      | null;
  };
};

export type AirstackNFTSaleTransactions = {
  NFTSaleTransactions: {
    NFTSaleTransaction: {
      paymentAmount: string;
    }[];
    pageInfo: {
      prevCursor: string;
      nextCursor: string;
    };
  };
};

export type AirstackResponse<T> = {
  data: T;
};

export type BlockchainName = 'ethereum' | 'polygon';
