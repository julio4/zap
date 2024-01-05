import { GraphQLClient, gql } from "graphql-request";
import { ERC20TokenBalance, TokenBalancesResponse } from "./airstack/types.js";
import { deduplicateTokens } from "./airstack/utils.js";

const defaultBlockchain = "ethereum";
const API = process.env.AIRSTACK_ENDPOINT || "https://api.airstack.xyz/gql/";

if (!process.env.AIRSTACK_API_KEY)
  throw new Error("AIRSTACK_API_KEY env var is not set");
const AIRSTACK_API_KEY: string = process.env.AIRSTACK_API_KEY;

// This is an example service that returns random data
class AirstackService {
  static async getAllTokens(
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
}

export default AirstackService;
