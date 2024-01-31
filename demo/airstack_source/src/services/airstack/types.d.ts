export enum Blockchain {
  Ethereum = 'ethereum',
  Polygon = 'polygon',
  Base = 'base',
}

/* General Query Response and PageInfo types */

interface PageInfo {
  nextCursor: string
  prevCursor: string
  hasNextPage: boolean
  hasPrevPage: boolean
}

/* Types used for fetching all ERC20 */
export interface TokenBalancesResponse {
  TokenBalances: {
    TokenBalance: ERC20TokenBalance[]
  }
}

export interface ERC20TokenBalance {
  tokenAddress: string
  formattedAmount: number
  token: {
    id: string
    isSpam: boolean
    logo: Logo | null
    name: string
  }
}

export interface Logo {
  small: string | null
}

/* Types used for fetching all NFTs */
type TokenType = 'ERC721' | 'ERC1155'

export interface TokenNft {
  address: string
  tokenId: string
  blockchain: Blockchain
  contentValue: ContentValue
}

interface ContentValue {
  image?: Image
}

interface Image {
  original: string
}

// NFT TokenBalance Type
export interface NFTTokenBalance {
  tokenAddress: string
  amount: string
  formattedAmount: number
  tokenType: TokenType
  tokenNfts: TokenNft
}

// BlockchainNFTTokenBalances Interface for NFTs
export interface BlockchainNFTTokenBalances {
  TokenBalance: NFTTokenBalance[]
  pageInfo: PageInfo
}

// Blockchain Specific TokenBalances Response for NFTs
export interface EthereumNFTTokenBalancesResponse {
  ethereum: BlockchainNFTTokenBalances
}

export interface PolygonNFTTokenBalancesResponse {
  polygon: BlockchainNFTTokenBalances
}

export interface BaseNFTTokenBalancesResponse {
  base: BlockchainNFTTokenBalances
}

// Union type for NFT responses
export type NFTTokenBalancesResponse =
  | EthereumNFTTokenBalancesResponse
  | PolygonNFTTokenBalancesResponse
  | BaseNFTTokenBalancesResponse
/*  Miscelaneous types */

export interface AirstackTokenBalance {
  TokenBalances: {
    TokenBalance: Array<{
      token: {
        id: string
      }
      formattedAmount: number
    }>
  }
}

export interface AirstackPoapHolder {
  Poaps: {
    Poap:
    | Array<{
      owner: {
        identity: string
      }
    }>
    | null
  }
}

export interface AirstackNftHolder {
  TokenBalances: {
    TokenBalance:
    | Array<{
      owner: {
        addresses: string[]
      }
    }>
    | null
  }
}

interface XmtpData {
  isXMTPEnabled: boolean
}

export interface AirstackXmtpEnabled {
  Wallet: {
    xmtp: XmtpData[] | null
  }
}

export interface AirstackEnsHolder {
  Wallet: {
    domains:
    | Array<{
      name: string
    }>
    | null
  }
}

export interface AirstackSocialsHolder {
  Wallet: {
    socials:
    | Array<{
      dappName: string
      profileName: string
    }>
    | null
  }
}

export interface AirstackNFTSaleTransactions {
  NFTSaleTransactions: {
    NFTSaleTransaction: Array<{
      paymentAmount: string
    }>
    pageInfo: {
      prevCursor: string
      nextCursor: string
    }
  }
}

export interface AirstackResponse<T> {
  data: T
}

export type BlockchainName = 'ethereum' | 'polygon'
