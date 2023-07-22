import { request, gql } from 'graphql-request';
import {
  AirstackEnsHolder,
  AirstackNFTSaleTransactions,
  AirstackNftHolder,
  AirstackPoapHolder,
  AirstackResponse,
  AirstackSocialsHolder,
  AirstackTokenBalance,
  AirstackXmtpEnabled,
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

  if (!blockchain) {
    console.log('No blockchain specified, defaulting to ethereum');
    blockchain = 'ethereum';
  }

  if (token == undefined) {
    throw new Error('No token specified');
  }

  const balanceQuery = gql`
    query Balance {
      TokenBalance(
        input: {
          blockchain: ${blockchain}
          tokenAddress: "${token}"
          owner: "${owner}"
        }
      ) {
        formattedAmount
      }
    }
  `;

  const res = await request<AirstackTokenBalance>(
    AIRSTACK_ENDPOINT,
    balanceQuery
  );

  return res.TokenBalance?.formattedAmount || 0;
}

export async function isPoapHolder(
  owner: string,
  poapId: string // eventId
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

  const res = await request<AirstackResponse<AirstackPoapHolder>>(
    AIRSTACK_ENDPOINT,
    poapQuery
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


  const response = await request<AirstackNftHolder>(
    AIRSTACK_ENDPOINT,
    nftQuery
  );

  const nftCount = response.TokenBalances.TokenBalance
    ? response.TokenBalances.TokenBalance.length
    : 0;

  return nftCount;
}

export async function isXMTPenabled(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], isXMTPenabled);
  }
  const XMTPquery = gql`
    query GetSocial {
      Wallet(
        input: {
          identity: ${owner}
          blockchain: ethereum
        }
      ) {
        xmtp {
          isXMTPEnabled
        }
      }
    }
  `;

  const variables = {
    owner,
  };

  const response = await request<AirstackResponse<AirstackXmtpEnabled>>(
    AIRSTACK_ENDPOINT,
    XMTPquery,
    variables
  );

  const responseIsEnabled = response.data.Wallet.xmtp ? 1 : 0;

  return responseIsEnabled;
}

export async function isEnsHolder(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], isEnsHolder);
  }
  const EnsQuery = gql`
    query GetSocial {
      Wallet(
        input: {
          identity: ${owner}
          blockchain: ethereum
        }
      ) {
        domains {
          name
        }
      }
    }
  `;

  const variables = {
    owner,
  };

  const response = await request<AirstackResponse<AirstackEnsHolder>>(
    AIRSTACK_ENDPOINT,
    EnsQuery,
    variables
  );

  const responseEns = response.data.Wallet.primaryDomain ? 1 : 0;

  return responseEns;
}

export async function isLensHolder(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], isLensHolder);
  }
  const LensQuery = gql`
    query GetSocial {
      Wallet(
        input: {
          identity: ${owner}
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

  const variables = {
    owner,
  };

  const response = await request<AirstackResponse<AirstackSocialsHolder>>(
    AIRSTACK_ENDPOINT,
    LensQuery,
    variables
  );
  let lensHeld: number = 0;
  if (response.data.Wallet.socials) {
    lensHeld = response.data.Wallet.socials.some(
      (social) => social.dappName === 'lens'
    )
      ? 1
      : 0;
  }
  return lensHeld; // not Lens holder
}

export async function isFarcasterHolder(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], isFarcasterHolder);
  }
  const FarcasterQuery = gql`
    query GetSocial {
      Wallet(
        input: {
          identity: ${owner}
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

  const variables = {
    owner,
  };

  const response = await request<AirstackResponse<AirstackSocialsHolder>>(
    AIRSTACK_ENDPOINT,
    FarcasterQuery,
    variables
  );
  let farcasterHeld: number = 0;
  if (response.data.Wallet.socials) {
    farcasterHeld = response.data.Wallet.socials.some(
      (social) => social.dappName === 'farcaster'
    )
      ? 1
      : 0;
  }
  return farcasterHeld; // not Farcaster holder
}

export async function getNftSaleVolume(owner: string): Promise<bigint> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], getNftSaleVolume);
  }
  let cursor: string = ''; // initialize cursor

  const totalNftVolumeQuery = gql`
    query MyQuery {
      NFTSaleTransactions(
        input: {
          filter: { from: { _eq: ${owner} } }
          blockchain: ethereum
          limit: 50
          cursor: ${cursor}
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
    }
  `;

  const variables = {
    owner,
  };

  let totalVolume: bigint = BigInt(0); // initialize total amount

  while (true) {
    const variables = {
      owner,
      cursor,
    };

    const response = await request<
      AirstackResponse<AirstackNFTSaleTransactions>
    >(AIRSTACK_ENDPOINT, totalNftVolumeQuery, variables);

    if (response.data.NFTSaleTransactions.NFTSaleTransaction) {
      for (let transaction of response.data.NFTSaleTransactions
        .NFTSaleTransaction) {
        totalVolume += BigInt(transaction.paymentAmount);
      }
    }

    cursor = response.data.NFTSaleTransactions.pageInfo.nextCursor;

    if (!cursor) break; // stop if there's no next cursor
  }

  return totalVolume;
}
