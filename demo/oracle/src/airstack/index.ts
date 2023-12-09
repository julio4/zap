import { request, gql } from 'graphql-request';
import {
  AirstackEnsHolder,
  AirstackNFTSaleTransactions,
  AirstackNftHolder,
  AirstackPoapHolder,
  AirstackSocialsHolder,
  AirstackTokenBalance,
  AirstackXmtpEnabled,
  BlockchainName,
} from './types';
import Mock from './mocked.js';
import { AIRSTACK_ENDPOINT, defaultBlockchain } from './config';

const mockMiddleware = (args: any[], fn: (...args: any[]) => any) =>
  (Mock as any)[fn.name](...args);

export async function getBalance(
  owner: string,
  token: string,
  blockchain: BlockchainName
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, token], getBalance);
  }

  if (!blockchain) {
    console.log(`No blockchain specified, defaulting to ${defaultBlockchain}`);
    blockchain = defaultBlockchain;
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
  if (poapId == undefined) {
    throw new Error('No poapId specified');
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

  const res = await request<AirstackPoapHolder>(AIRSTACK_ENDPOINT, poapQuery);

  return res.Poaps.Poap ? 1 : 0;
}

export async function isNftHolder(
  owner: string,
  nftAddress: string, // address
  blockchain: BlockchainName // ethereum or polygon
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, nftAddress], isNftHolder);
  }

  if (!blockchain) {
    console.log(`No blockchain specified, defaulting to ${defaultBlockchain}`);
    blockchain = defaultBlockchain;
  }

  if (nftAddress == undefined) {
    throw new Error('No nftAddress specified');
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

  const response = await request<AirstackXmtpEnabled>(
    AIRSTACK_ENDPOINT,
    XMTPquery
  );

  return response.Wallet.xmtp ? 1 : 0;
}

export async function isEnsHolder(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], isEnsHolder);
  }
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

  const response = await request<AirstackEnsHolder>(
    AIRSTACK_ENDPOINT,
    EnsQuery
  );

  let domainCount = 0;

  if (response.Wallet.domains) {
    domainCount = response.Wallet.domains.length;
  }

  return domainCount;
}

export async function isLensHolder(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], isLensHolder);
  }
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

  const response = await request<AirstackSocialsHolder>(
    AIRSTACK_ENDPOINT,
    LensQuery
  );
  let lensHeld = 0;
  if (response.Wallet.socials) {
    lensHeld = response.Wallet.socials.some(
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

  const response = await request<AirstackSocialsHolder>(
    AIRSTACK_ENDPOINT,
    FarcasterQuery
  );
  let farcasterHeld = 0;
  if (response.Wallet.socials) {
    farcasterHeld = response.Wallet.socials.some(
      (social) => social.dappName === 'farcaster'
    )
      ? 1
      : 0;
  }
  return farcasterHeld; // not Farcaster holder
}

export async function getNftSaleVolume(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], getNftSaleVolume);
  }
  let cursor = ''; // initialize cursor

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
      AIRSTACK_ENDPOINT,
      totalNftVolumeQuery
    );

    if (response.NFTSaleTransactions.NFTSaleTransaction) {
      for (let transaction of response.NFTSaleTransactions.NFTSaleTransaction) {
        const transactionInEth = parseInt(transaction.paymentAmount) / 1e18;
        totalVolume += transactionInEth;
      }
    }

    cursor = response.NFTSaleTransactions.pageInfo.nextCursor;

    if (!cursor) break; // stop if there's no next cursor
  }

  return totalVolume;
}
