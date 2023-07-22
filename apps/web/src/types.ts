import { JsonRpcSigner } from "ethers";

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
  EQUAL = "==",
  LESS_THAN = "<",
  GREATER_THAN = ">",
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
  NFT_ETH = "/nftETH",
  NFT_POL = "/nftPolygon",
  POAP = "/poap",
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
    route: OracleRoute.NFT_ETH,
    name: "NFT_ETH",
    description: "Statement on a target ERC721 token balance on Ethereum",
    args: [
      {
        name: "nftAddress",
        type: "text",
        label: "Target ERC721 Token Address",
        placeholder: "0x...",
      },
    ],
    possibleConditions: [
      Condition.EQUAL,
      Condition.LESS_THAN,
      Condition.GREATER_THAN,
    ],
  },
  {
    route: OracleRoute.NFT_POL,
    name: "NFT_POL",
    description: "Statement on a target ERC721 token balance on Polygon",
    args: [
      {
        name: "nftAddress",
        type: "text",
        label: "Target ERC721 Token Address",
        placeholder: "0x...",
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
];
