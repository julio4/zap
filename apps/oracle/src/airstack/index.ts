import { request, gql } from 'graphql-request';
import {
  AirstackNftHolderETH,
  AirstackNftHolderPolygon,
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
  token: string
): Promise<string> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, token], getBalance);
  }
  const balanceQuery = gql`
    query Balance($blockchain: String!, $owner: String!, $token: String!) {
      TokenBalance(
        input: { blockchain: $blockchain, tokenAddress: $token, owner: $owner }
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

  return res.data.TokenBalance?.formattedAmount.toString() || '0';
}

export async function isPoapHolder(
  owner: string,
  poapId: string // eventId
): Promise<string> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, poapId], isPoapHolder);
  }
  const poapQuery = gql`
    query GetPoapHolders($eventId: [String!], $limit: Int, $owner: String!) {
      Poaps(
        input: {
          filter: { eventId: { _in: $eventId }, owner: { _eq: $owner } }
          blockchain: ALL
          limit: $limit
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

  return res.data.Poaps?.Poap?.owner?.identity || '';
}

export async function isNftHolderETH(
  owner: string,
  nftAddress: string // address
): Promise<string> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, nftAddress], isNftHolderETH);
  }
  const nftQueryETH = gql`
    query GetTokenHolders($tokenAddress: Address, $limit: Int, $owner: String!) {
      ethereum: TokenBalances(
        input: {
          filter: {
            tokenAddress: { _eq: $tokenAddress }
            owner: { _eq: $owner }
          }
          blockchain: ethereum
          limit: $limit
        }
      ) {
        TokenBalance {
          owner {
            identity
          }
        }
      }
    }
  `;

  const variables = {
    owner,
    eventId: nftAddress,
  };

  const res = await request<AirstackResponse<AirstackNftHolderETH>>(
    AIRSTACK_ENDPOINT,
    nftQueryETH,
    variables
  );

  return res.data.ethereum?.TokenBalance?.owner[0]?.identity || '';
}

export async function isNftHolderPolygon(
  owner: string,
  nftAddress: string // address
): Promise<string> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, nftAddress], isNftHolderPolygon);
  }
  const nftQueryPolygon = gql`query GetTokenHolders($tokenAddress: Address, $limit: Int) {
    polygon: TokenBalances(
      input: {filter: {tokenAddress: {_eq: $tokenAddress},  owner: {_eq: }},  blockchain: polygon, limit: $limit}
    ) {
      TokenBalance {
        owner {
          identity
        }
      }
    }
  }
  `;

  const variables = {
    owner,
    eventId: nftAddress,
  };

  const res = await request<AirstackResponse<AirstackNftHolderPolygon>>(
    AIRSTACK_ENDPOINT,
    nftQueryPolygon,
    variables
  );

  return res.data.polygon?.TokenBalance?.owner[0]?.identity || '';
}
