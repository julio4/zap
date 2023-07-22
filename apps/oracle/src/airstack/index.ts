import { request, gql } from 'graphql-request';
import { AirstackResponse, AirstackTokenBalance } from './types';
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
