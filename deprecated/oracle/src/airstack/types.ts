export enum BlockchainType {
  Ethereum = 'ethereum',
  Polygon = 'polygon',
  Base = 'base',
}

type Blockchain = 'ethereum' | 'polygon' | 'base';

/* General Query Response and PageInfo types */

interface PageInfo {
  nextCursor: string;
  prevCursor: string;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/* Types used for fetching all ERC20 */
export type TokenBalancesResponse = {
  TokenBalances: {
    TokenBalance: ERC20TokenBalance[];
  };
};
export type ERC20TokenBalance = {
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
type TokenType = 'ERC721' | 'ERC1155';

export interface TokenNft {
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

// NFT TokenBalance Type
export interface NFTTokenBalance {
  tokenAddress: string;
  amount: string;
  formattedAmount: number;
  tokenNfts: TokenNft;
  tokenType: TokenType;
}

// BlockchainNFTTokenBalances Interface for NFTs
export interface BlockchainNFTTokenBalances {
  TokenBalance: NFTTokenBalance[];
  pageInfo: PageInfo;
}

// Blockchain Specific TokenBalances Response for NFTs
export interface EthereumNFTTokenBalancesResponse {
  ethereum: BlockchainNFTTokenBalances;
}

export interface PolygonNFTTokenBalancesResponse {
  polygon: BlockchainNFTTokenBalances;
}

export interface BaseNFTTokenBalancesResponse {
  base: BlockchainNFTTokenBalances;
}

// Union type for NFT responses
export type NFTTokenBalancesResponse =
  | EthereumNFTTokenBalancesResponse
  | PolygonNFTTokenBalancesResponse
  | BaseNFTTokenBalancesResponse;
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

export type Route = {
  path: string;
  args?: {
      [key: string]: any;
  };
};