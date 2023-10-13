import { JsonRpcSigner } from "ethers";
import { Field, PublicKey, Signature } from "o1js";

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

export type StatementCondition = {
  type: Condition;
  targetValue: number;
};

export type Statement = {
  request: OracleRequest;
  condition: StatementCondition;
};

export type HTMLInputSchema = {
  name: string;
  type: "text" | "number" | "textarea";
  label: string;
  placeholder: string;
  value?: string;
};

export type StatementChoice = {
  route: OracleRoute;
  name: string;
  description: string;
  args: HTMLInputSchema[];
  possibleConditions: Condition[];
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
        type: "text",
        label: "Target Blockchain",
        placeholder: "ethereum | polygon",
      },
    ],
    possibleConditions: [
      Condition.EQUAL,
      Condition.LESS_THAN,
      Condition.GREATER_THAN,
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
        type: "text",
        label: "Target Blockchain",
        placeholder: "ethereum | polygon",
      },
    ],
    possibleConditions: [
      Condition.EQUAL,
      Condition.LESS_THAN,
      Condition.GREATER_THAN,
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
    possibleConditions: [Condition.EQUAL],
  },
  {
    route: OracleRoute.XMTP_ENABLED,
    name: "XMTP Enabled",
    description: "Check if the user has enabled XMTP",
    args: [],
    possibleConditions: [Condition.EQUAL],
  },
  {
    route: OracleRoute.ENS,
    name: "ENS domains",
    description: "Check if the user got some ENS domains",
    args: [],
    possibleConditions: [
      Condition.EQUAL,
      Condition.LESS_THAN,
      Condition.GREATER_THAN,
    ],
  },
  {
    route: OracleRoute.LENS,
    name: "Lens profile",
    description: "Check if the user got a Lens profile",
    args: [],
    possibleConditions: [Condition.EQUAL],
  },
  {
    route: OracleRoute.FARCASTER,
    name: "Farcaster profile",
    description: "Check if the user got a Farcaster profile",
    args: [],
    possibleConditions: [Condition.EQUAL],
  },
  {
    route: OracleRoute.TOTAL_NFT_VOLUME,
    name: "Total NFT Volume",
    description: "Check the total volume of NFTs sold by the user",
    args: [],
    possibleConditions: [
      Condition.EQUAL,
      Condition.LESS_THAN,
      Condition.GREATER_THAN,
    ],
  },
];

export type SignResponse = {
  data: string[]; // data.map((field) => Field.from(field))
  signature: string; // Signature.fromBase58()
  publicKey: string; // PublicKey.fromBase58()
};

export type PrivateData = {
  data: {
    value: number;
    hashRoute: string;
  },
  signature: string;
  publicKey: string;
}