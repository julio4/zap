import { request, gql, GraphQLClient } from 'graphql-request';
import util from 'util';
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
  ERC20TokenBalancesResponse,
  TokenBalance,
  TokenBalancesResponse,
} from './types';
import Mock from './mocked.js';
import { AIRSTACK_ENDPOINT, defaultBlockchain } from './config.js';
import { config } from 'dotenv';
import { deduplicateTokens } from '../utils.js';
config();

const AIRSTACK_API_KEY = process.env['AIRSTACK_API_KEY'];

if (!AIRSTACK_API_KEY) {
  throw new Error('Missing AIRSTACK_API_KEY');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockMiddleware = (args: any[], fn: (...args: any[]) => any) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Mock as any)[fn.name](...args);

export async function getAllTokens(
  owner: string
): Promise<[TokenBalance[], TokenBalance[]]> {
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
    if (!AIRSTACK_API_KEY) {
      throw new Error('Missing AIRSTACK_API_KEY');
    }
    const graphQLClient = new GraphQLClient(AIRSTACK_ENDPOINT, {
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
    console.log('Error in getBalances: ', e);
    throw new Error((e as Error)?.message);
  }
}

export async function getAllERC20Tokens(
  owner: string
): Promise<[ERC20TokenBalance[], ERC20TokenBalance[]]> {
  const queryNFTsEth = gql`
    query GetNFTs {
      ethereum: TokenBalances(
        input: {
          filter: {
            owner: { _eq: "0xbbbc1f6be7a36f9b49f807ae24ed7ebab34d82ce" }
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
            contentValue {
              image {
                original
              }
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
    query GetNFTs {
      polygon: TokenBalances(
        input: {
          filter: {
            owner: { _eq: "0xbbbc1f6be7a36f9b49f807ae24ed7ebab34d82ce" }
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
            contentValue {
              image {
                original
              }
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
    if (!AIRSTACK_API_KEY) {
      throw new Error('Missing AIRSTACK_API_KEY');
    }
    const graphQLClient = new GraphQLClient(AIRSTACK_ENDPOINT, {
      headers: {
        Authorization: AIRSTACK_API_KEY,
      },
    });

    const resEthereum = await graphQLClient.request<ERC20TokenBalancesResponse>(
      queryNFTsEth
    );
    const resPolygon = await graphQLClient.request<ERC20TokenBalancesResponse>(
      queryNFTsPolygon
    );

    let tokensEthereum = resEthereum.TokenBalances.TokenBalance || [];
    let tokensPolygon = resPolygon.TokenBalances.TokenBalance || [];

    console.log(util.inspect(tokensEthereum, false, null, true /* enable colors */));

    return [tokensEthereum, tokensPolygon];
  } catch (e) {
    console.error('Error in getAllERC20Tokens: ', e);
    throw new Error((e as Error)?.message);
  }
}

export async function getBalance(
  owner: string,
  token: string,
  blockchain: BlockchainName
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, token], Mock.getBalance);
  }

  if (!blockchain) {
    console.log(`No blockchain specified, defaulting to ${defaultBlockchain}`);
    blockchain = defaultBlockchain;
  }

  if (token == undefined) {
    throw new Error('No token specified');
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
    if (!AIRSTACK_API_KEY) {
      throw new Error('Missing AIRSTACK_API_KEY');
    }
    const graphQLClient = new GraphQLClient(AIRSTACK_ENDPOINT, {
      headers: {
        Authorization: AIRSTACK_API_KEY,
      },
    });
    const res = await graphQLClient.request<AirstackTokenBalance>(balanceQuery);

    if (!res.TokenBalances.TokenBalance) {
      console.log('No token balance found');
      return 0;
    }

    return res.TokenBalances.TokenBalance[0].formattedAmount;
  } catch (e) {
    throw new Error((e as Error)?.message);
  }
}

export async function isPoapHolder(
  owner: string,
  poapId: string // eventId
): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner, poapId], Mock.isPoapHolder);
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
    return mockMiddleware([owner, nftAddress], Mock.isNftHolder);
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

  console.log(util.inspect(response, false, null, true /* enable colors */));

  const nftCount = response.TokenBalances.TokenBalance
    ? response.TokenBalances.TokenBalance.length
    : 0;

  return nftCount;
}

export async function isXMTPenabled(owner: string): Promise<number> {
  if (process.env['NODE_ENV'] === 'development') {
    return mockMiddleware([owner], Mock.isXMTPenabled);
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
    return mockMiddleware([owner], Mock.isEnsHolder);
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
    return mockMiddleware([owner], Mock.isLensHolder);
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
    return mockMiddleware([owner], Mock.isFarcasterHolder);
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
    return mockMiddleware([owner], Mock.getUserNftVolumeSales);
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
