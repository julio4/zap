export enum BlockchainType {
  Ethereum = 'ethereum',
  Polygon = 'polygon',
  Base = 'base',
}

/* General Airstack types */

interface QueryResponse {
  data: Data;
}

interface Data {
  ethereum: BlockchainTokenBalances;
  polygon: BlockchainTokenBalances;
  base: BlockchainTokenBalances;
}

interface BlockchainTokenBalances {
  TokenBalance: TokenBalance[];
  pageInfo: PageInfo;
}

interface PageInfo {
  nextCursor: string;
  prevCursor: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

type TokenType = 'ERC721' | 'ERC1155';
type Blockchain = 'ethereum' | 'polygon' | 'base';

/* Types used for fetching all ERC20 */
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

/* Types used for fetching all NFTs */

export interface ERC20TokenBalance {
  tokenAddress: string;
  formattedAmount: number;
  token: ERC20Token;
}

interface ERC20Token {
  id: string;
  isSpam: boolean;
  logo: TokenLogo;
  name: string;
}

interface TokenLogo {
  small: string;
}

export interface EthereumTokenBalancesResponse {
  ethereum: {
    TokenBalance: ERC20TokenBalance[];
  };
}

export interface PolygonTokenBalancesResponse {
  polygon: {
    TokenBalance: ERC20TokenBalance[];
  };
}

export interface BaseTokenBalancesResponse {
  base: {
    TokenBalance: ERC20TokenBalance[];
  };
}

// Union type for the overall response
export type ERC20TokenBalancesResponse =
  | EthereumTokenBalancesResponse
  | PolygonTokenBalancesResponse
  | BaseTokenBalancesResponse;

interface TokenNft {
  address: string;
  tokenId: string;
  blockchain: Blockchain;
  contentValue: ContentValue;
}

interface ContentValue {
  image?: Image;
}

interface Image {
  original: string;
}

/*  Miscelaneous types */

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
