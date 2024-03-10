import { ConditionType } from "@zap/types";
import { JsonRpcSigner } from "ethers";

declare global {
  interface Window {
    ethereum: any;
    mina: any;
  }
}

export type MinaWallet = {
  isConnected: boolean;
  address: string;
};

export type EthereumWallet = {
  isConnected: boolean;
  address: string;
  signature: string;
  signer?: JsonRpcSigner;
};

export enum Condition {
  // LESS_THAN = "1",
  // GREATER_THAN = "2",
  // EQUAL = "3",
  // DIFFERENT = "4",
  LESS_THAN = "<",
  GREATER_THAN = ">",
  EQUAL = "==",
  DIFFERENT = "!=",
}


export type HTMLInputSchema =
  | {
      name: string;
      type: "text" | "number" | "textarea";
      label: string;
      placeholder: string;
      value?: string;
    }
  | {
      name: string;
      type: "select";
      label: string;
      options: string[];
    };

export type StatementChoice = {
  route: OracleRoute;
  name: string;
  description: string;
  args: HTMLInputSchema[];
  possibleConditions: ConditionType[];
};

export enum OracleRoute {
  BALANCE = "/balance",
  NFT = "/nft",
  POAP = "/poap",
  XMTP_ENABLED = "/xmtpEnabled",
  ENS = "/ens",
  LENS = "/lens",
  FARCASTER = "/farcaster",
  TOTAL_NFT_VOLUME = "/totalNftVolume",
}

export type OracleRequest = {
  route: OracleRoute;
  args: { [key: string]: any };
};

export const StatementChoices: StatementChoice[] = [
  {
    route: OracleRoute.BALANCE,
    name: "Balance",
    description: "Statement on a target ERC20 token balance",
    args: [
      {
        name: "token",
        type: "text",
        label: "Target ERC20 Token Address",
        placeholder: "0x...",
      },
      {
        name: "blockchain",
        type: "select",
        label: "Target Blockchain",
        options: ["ethereum", "polygon"],
      },
    ],
    possibleConditions: [
      ConditionType.EQ,
      ConditionType.LT,
      ConditionType.GT,
    ],
  },
  {
    route: OracleRoute.NFT,
    name: "NFT",
    description: "Statement on a target ERC721 token balance on Ethereum",
    args: [
      {
        name: "nftAddress",
        type: "text",
        label: "ERC721 Token Address",
        placeholder: "0x...",
      },
      {
        name: "blockchain",
        type: "select",
        label: "Target Blockchain",
        options: ["ethereum", "polygon"],
      },
    ],
    possibleConditions: [
      ConditionType.EQ,
      ConditionType.LT,
      ConditionType.GT,
    ],
  },
  {
    route: OracleRoute.POAP,
    name: "POAP",
    description: "Statement on a target POAP event",
    args: [
      {
        name: "event_id",
        type: "text",
        label: "Target POAP event id",
        placeholder: "0x...",
      },
    ],
    possibleConditions: [ConditionType.EQ],
  },
  {
    route: OracleRoute.XMTP_ENABLED,
    name: "XMTP Enabled",
    description: "Check if the user has enabled XMTP",
    args: [],
    possibleConditions: [ConditionType.EQ],
  },
  {
    route: OracleRoute.ENS,
    name: "ENS domains",
    description: "Check if the user got some ENS domains",
    args: [],
    possibleConditions: [
      ConditionType.EQ,
      ConditionType.LT,
      ConditionType.GT,
    ],
  },
  {
    route: OracleRoute.LENS,
    name: "Lens profile",
    description: "Check if the user got a Lens profile",
    args: [],
    possibleConditions: [ConditionType.EQ],
  },
  {
    route: OracleRoute.FARCASTER,
    name: "Farcaster profile",
    description: "Check if the user got a Farcaster profile",
    args: [],
    possibleConditions: [ConditionType.EQ],
  },
  {
    route: OracleRoute.TOTAL_NFT_VOLUME,
    name: "Total NFT Volume",
    description: "Check the total volume of NFTs sold by the user",
    args: [],
    possibleConditions: [
      ConditionType.EQ,
      ConditionType.LT,
      ConditionType.GT,
    ],
  },
];

export type SignResponse = {
  data: string[]; // data.map((field) => field.toString())
  signature: string; // Signature.toBase58()
  publicKey: string; // PublicKey.toBase58()
};

export type PrivateData = {
  data: {
    value: number;
    hashRoute: string;
  };
  signature: string;
  publicKey: string;
};

export type AttestationNote = {
  attestationHash: string;
  statement: string;
  targetValue: number;
  conditionType: string;
  hashRoute: string;
  sender: string;
};

export type AttestationNoteDated = {
  attestationNote: AttestationNote;
  date: string;
};

export type ArgsHashAttestationCalculator = {
  conditionType: string | number;
  hashRoute: string;
  targetValue: number;
  sender: string;
};

export type TokenBalancesResponse = {
  TokenBalances: {
    TokenBalance: TokenBalance[];
  };
};

export type TokenBalance = {
  tokenAddress: string;
  formattedAmount: number;
  token: {
    id: string;
    isSpam: boolean;
    logo: Logo;
    name: string;
  };
};

/* Types used for fetching all NFTs */
type TokenType = "ERC721" | "ERC1155";
type Blockchain = "ethereum" | "polygon" | "base";

export interface TokenNft {
  address: string;
  blockchain: Blockchain;
  metaData: {
    image: string;
  };
  token: {
    name: string;
  };
  tokenId: string;
}

// NFT TokenBalance Type
export interface NFTTokenBalance {
  amount: string;
  formattedAmount: number;
  tokenAddress: string;
  tokenNfts: TokenNft;
  tokenType: TokenType;
}

export type Logo = {
  small: string | null;
};
