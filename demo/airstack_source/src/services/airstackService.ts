import { GraphQLClient, gql, request } from "graphql-request";
import {
  AirstackEnsHolder,
  AirstackNFTSaleTransactions,
  AirstackNftHolder,
  AirstackPoapHolder,
  AirstackSocialsHolder,
  AirstackTokenBalance,
  AirstackXmtpEnabled,
  BlockchainName,
  ERC20TokenBalance,
  TokenBalancesResponse,
  EthereumNFTTokenBalancesResponse,
  NFTTokenBalance,
  PolygonNFTTokenBalancesResponse,
} from "./airstack/types.js";
import { deduplicateTokens } from "./airstack/utils.js";
import util from "util";
import "dotenv/config";

const defaultBlockchain = "ethereum";
const API = process.env.AIRSTACK_ENDPOINT || "https://api.airstack.xyz/gql/";

if (!process.env.AIRSTACK_API_KEY)
  throw new Error("AIRSTACK_API_KEY env var is not set");
const AIRSTACK_API_KEY: string = process.env.AIRSTACK_API_KEY;

// This is an example service that returns random data
class AirstackService {
  static async getAllERC20Tokens(
    owner: string
  ): Promise<[ERC20TokenBalance[], ERC20TokenBalance[]]> {
    const balanceQueryEthereum = gql`
      query TokenBalancesEthereum {
        TokenBalances(
          input: {
            filter: {
              owner: { _eq: "${owner}" }
              formattedAmount: { _gt: 0 }
            }
            blockchain: ethereum
          }
        ) {
          TokenBalance {
            tokenAddress
            formattedAmount
            token {
              id
              isSpam
              logo {
                small
              }
              name
            }
          }
        }
      }
    `;

    const balanceQueryPolygon = gql`
      query TokenBalancesPolygon {
        TokenBalances(
          input: {
            filter: {
              owner: { _eq: "${owner}" }
              formattedAmount: { _gt: 0 }
            }
            blockchain: polygon
          }
        ) {
          TokenBalance {
            tokenAddress
            formattedAmount
            token {
              id
              isSpam
              logo {
                small
              }
              name
            }
          }
        }
      }
    `;

    try {
      const graphQLClient = new GraphQLClient(API, {
        headers: {
          Authorization: AIRSTACK_API_KEY,
        },
      });

      const resEthereum = await graphQLClient.request<TokenBalancesResponse>(
        balanceQueryEthereum
      );
      const resPolygon = await graphQLClient.request<TokenBalancesResponse>(
        balanceQueryPolygon
      );

      let tokensEthereum = resEthereum.TokenBalances.TokenBalance || [];
      let tokensPolygon = resPolygon.TokenBalances.TokenBalance || [];

      // deduplicate tokens
      tokensEthereum = deduplicateTokens(tokensEthereum);
      tokensPolygon = deduplicateTokens(tokensPolygon);

      // filter to keep only non-spam tokens
      if (!resEthereum.TokenBalances.TokenBalance) {
        resEthereum.TokenBalances.TokenBalance = [];
      }
      if (!resPolygon.TokenBalances.TokenBalance) {
        resPolygon.TokenBalances.TokenBalance = [];
      }

      tokensEthereum = resEthereum.TokenBalances.TokenBalance.filter(
        (token) => !token.token.isSpam
      );
      tokensPolygon = resPolygon.TokenBalances.TokenBalance.filter(
        (token) => !token.token.isSpam
      );

      // sort by balance
      tokensEthereum.sort((a, b) => b.formattedAmount - a.formattedAmount);
      tokensPolygon.sort((a, b) => b.formattedAmount - a.formattedAmount);

      return [tokensEthereum, tokensPolygon];
    } catch (e) {
      console.log("Error in getBalances: ", e);
      throw new Error((e as Error)?.message);
    }
  }

  static async getAllNftTokens(
    owner: string
  ): Promise<[NFTTokenBalance[], NFTTokenBalance[]]> {
    const queryNFTsEth = gql`
      query GetNFTsETH {
        ethereum: TokenBalances(
          input: {
            filter: {
              owner: { _eq: "0xbbbC1f6BE7a36F9B49F807AE24ed7EbAB34D82ce" }
              tokenType: { _in: [ERC1155, ERC721] }
            }
            blockchain: ethereum
            limit: 50
          }
        ) {
          TokenBalance {
            tokenAddress
            amount
            formattedAmount
            tokenType
            tokenNfts {
              address
              tokenId
              blockchain
              metaData {
                image
              }
              token {
                name
              }
            }
          }
          pageInfo {
            nextCursor
            prevCursor
            hasNextPage
            hasPrevPage
          }
        }
      }
    `;

    const queryNFTsPolygon = gql`
      query GetNFTsETH {
        polygon: TokenBalances(
          input: {
            filter: {
              owner: { _eq: "0xbbbC1f6BE7a36F9B49F807AE24ed7EbAB34D82ce" }
              tokenType: { _in: [ERC1155, ERC721] }
            }
            blockchain: polygon
            limit: 50
          }
        ) {
          TokenBalance {
            tokenAddress
            amount
            formattedAmount
            tokenType
            tokenNfts {
              address
              tokenId
              blockchain
              metaData {
                image
              }
              token {
                name
              }
            }
          }
          pageInfo {
            nextCursor
            prevCursor
            hasNextPage
            hasPrevPage
          }
        }
      }
    `;

    try {
      const graphQLClient = new GraphQLClient(API, {
        headers: {
          Authorization: AIRSTACK_API_KEY,
        },
      });

      const resEthereum =
        await graphQLClient.request<EthereumNFTTokenBalancesResponse>(
          queryNFTsEth
        );
      const resPolygon =
        await graphQLClient.request<PolygonNFTTokenBalancesResponse>(
          queryNFTsPolygon
        );

      let NFTsEthereum = resEthereum.ethereum.TokenBalance || [];
      let NFTsPolygon = resPolygon.polygon.TokenBalance || [];

      return [NFTsEthereum, NFTsPolygon];
    } catch (e) {
      console.error("Error in getAllERC20Tokens: ", e);
      throw new Error((e as Error)?.message);
    }
  }

  static async getBalance(
    owner: string,
    token: string,
    blockchain: BlockchainName
  ): Promise<number> {
    if (!blockchain) {
      console.log(
        `No blockchain specified, defaulting to ${defaultBlockchain}`
      );
      blockchain = defaultBlockchain;
    }

    if (token == undefined) {
      throw new Error("No token specified");
    }

    const balanceQuery = gql`
      query MyQuery {
        TokenBalances(
          input: {
            blockchain: ${blockchain}
            filter: {
              tokenAddress: { _eq: "${token}" }
              owner: { _eq: "${owner}" }
            }
          }
        ) {
          TokenBalance {
            token {
              id
            }
            formattedAmount
          }
        }
      }
    `;

    try {
      const graphQLClient = new GraphQLClient(API, {
        headers: {
          Authorization: AIRSTACK_API_KEY,
        },
      });
      const res = await graphQLClient.request<AirstackTokenBalance>(
        balanceQuery
      );

      if (!res.TokenBalances.TokenBalance) {
        console.log("No token balance found");
        return 0;
      }

      return res.TokenBalances.TokenBalance[0].formattedAmount;
    } catch (e) {
      throw new Error((e as Error)?.message);
    }
  }

  static async isPoapHolder(
    owner: string,
    poapId: string // eventId
  ): Promise<number> {
    if (poapId == undefined) {
      throw new Error("No poapId specified");
    }

    const poapQuery = gql`
      query GetPoapHolders {
        Poaps(
          input: {
            filter: { eventId: { _in: "${poapId}" }, owner: { _eq: "${owner}" } }
            blockchain: ALL
            limit: 200
          }
        ) {
          Poap {
            owner {
              identity
            }
          }
        }
      }
    `;

    const res = await request<AirstackPoapHolder>(API, poapQuery);

    return res.Poaps.Poap ? 1 : 0;
  }

  static async isNftHolder(
    owner: string,
    nftAddress: string, // address
    blockchain: BlockchainName // ethereum or polygon
  ): Promise<number> {
    if (!blockchain) {
      console.log(
        `No blockchain specified, defaulting to ${defaultBlockchain}`
      );
      blockchain = defaultBlockchain;
    }

    if (nftAddress == undefined) {
      throw new Error("No nftAddress specified");
    }

    const nftQuery = gql`
      query MyQuery {
        TokenBalances(
          input: {
            filter: {
              owner: { _eq: "${owner}" }
              tokenAddress: { _eq: "${nftAddress}" }
            }
            blockchain: ${blockchain}
            limit: 150
          }
        ) {
          TokenBalance {
            owner {
              addresses
            }
          }
        }
      }
    `;

    const response = await request<AirstackNftHolder>(API, nftQuery);

    console.log(util.inspect(response, false, null, true /* enable colors */));

    const nftCount = response.TokenBalances.TokenBalance
      ? response.TokenBalances.TokenBalance.length
      : 0;

    return nftCount;
  }

  static async isXMTPenabled(owner: string): Promise<number> {
    const XMTPquery = gql`
      query GetSocial {
        Wallet(
          input: {
            identity: "${owner}"
            blockchain: ethereum
          }
        ) {
          xmtp {
            isXMTPEnabled
          }
        }
      }
    `;

    const response = await request<AirstackXmtpEnabled>(API, XMTPquery);

    return response.Wallet.xmtp ? 1 : 0;
  }

  static async isEnsHolder(owner: string): Promise<number> {
    const EnsQuery = gql`
      query GetSocial {
        Wallet(
          input: {
            identity: "${owner}"
            blockchain: ethereum
          }
        ) {
          domains {
            name
          }
        }
      }
    `;

    const response = await request<AirstackEnsHolder>(API, EnsQuery);

    let domainCount = 0;

    if (response.Wallet.domains) {
      domainCount = response.Wallet.domains.length;
    }

    return domainCount;
  }

  static async isLensHolder(owner: string): Promise<number> {
    const LensQuery = gql`
      query GetSocial {
        Wallet(
          input: {
            identity: "${owner}"
            blockchain: ethereum
          }
        ) {
          socials {
            dappName
            profileName
          }
        }
      }
    `;

    const response = await request<AirstackSocialsHolder>(API, LensQuery);
    let lensHeld = 0;
    if (response.Wallet.socials) {
      lensHeld = response.Wallet.socials.some(
        (social) => social.dappName === "lens"
      )
        ? 1
        : 0;
    }
    return lensHeld; // not Lens holder
  }

  static async isFarcasterHolder(owner: string): Promise<number> {
    const FarcasterQuery = gql`
      query GetSocial {
        Wallet(
          input: {
            identity: "${owner}"
            blockchain: ethereum
          }
        ) {
          socials {
            dappName
            profileName
          }
        }
      }
    `;

    const response = await request<AirstackSocialsHolder>(API, FarcasterQuery);
    let farcasterHeld = 0;
    if (response.Wallet.socials) {
      farcasterHeld = response.Wallet.socials.some(
        (social) => social.dappName === "farcaster"
      )
        ? 1
        : 0;
    }
    return farcasterHeld; // not Farcaster holder
  }

  static async getNftSaleVolume(owner: string): Promise<number> {
    let cursor = ""; // initialize cursor

    let totalVolume = 0; // initialize total amount

    while (true) {
      const totalNftVolumeQuery = gql`
        query MyQuery {
          NFTSaleTransactions(
            input: {
              filter: { from: { _eq: "${owner}" } }
              blockchain: ethereum
              limit: 200
              cursor: "${cursor}"
            }
          ) {
            NFTSaleTransaction {
              paymentAmount
            }
            pageInfo {
              prevCursor
              nextCursor
            }
          }
        }`;

      const response = await request<AirstackNFTSaleTransactions>(
        API,
        totalNftVolumeQuery
      );

      if (response.NFTSaleTransactions.NFTSaleTransaction) {
        for (let transaction of response.NFTSaleTransactions
          .NFTSaleTransaction) {
          const transactionInEth = parseInt(transaction.paymentAmount) / 1e18;
          totalVolume += transactionInEth;
        }
      }

      cursor = response.NFTSaleTransactions.pageInfo.nextCursor;

      if (!cursor) break; // stop if there's no next cursor
    }

    return totalVolume;
  }
}

export default AirstackService;
