import { request, gql } from 'graphql-request';
import {
  AirstackNftHolder,
  AirstackPoapHolder,
  AirstackResponse,
  AirstackTokenBalance,
} from './types';
import Mock from './mocked.js';

const AIRSTACK_ENDPOINT =
  process.env['AIRSTACK_ENDPOINT'] || 'https://api.airstack.xyz/gql/';

const mockMiddleware = (args: any[], fn: (...args: any[]) => any) =>
  (Mock as any)[fn.name](...args);

export async function getBalance(
  owner: string,
  token: string,
  blockchain: string
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, token], getBalance);
  }
  const balanceQuery = gql`
    query Balance {
      TokenBalance(
        input: { blockchain: ${blockchain} , tokenAddress: $token, owner: $owner }
      ) {
        formattedAmount
      }
    }
  `;

  const variables = {
    blockchain: 'ethereum',
    owner,
    token,
  };

  const res = await request<AirstackResponse<AirstackTokenBalance>>(
    AIRSTACK_ENDPOINT,
    balanceQuery,
    variables
  );

  return res.data.TokenBalance?.formattedAmount || 0;
}

export async function isPoapHolder(
  owner: string,
  poapId: string, // eventId
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, poapId], isPoapHolder);
  }
  const poapQuery = gql`
    query GetPoapHolders {
      Poaps(
        input: {
          filter: { eventId: { _in: ${poapId} }, owner: { _eq: ${owner} } }
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

  const variables = {
    owner,
    eventId: poapId,
  };

  const res = await request<AirstackResponse<AirstackPoapHolder>>(
    AIRSTACK_ENDPOINT,
    poapQuery,
    variables
  );

  const poapHeld = res.data.Poaps.Poap ? 1 : 0;
  return poapHeld;
}

export async function isNftHolder(
  owner: string,
  nftAddress: string, // address
  blockchain: string // ethereum or polygon
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, nftAddress], isNftHolder);
  }
  const nftQueryETH = gql`
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
    }
  `;

  const variables = {
    owner,
    nftAddress,
  };

  const response = await request<AirstackResponse<AirstackNftHolder>>(
    AIRSTACK_ENDPOINT,
    nftQueryETH,
    variables
  );

  const nftCount = response.data.TokenBalances.TokenBalance
    ? response.data.TokenBalances.TokenBalance.length
    : 0;

  return nftCount;
}
