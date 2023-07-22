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

export enum OracleRoute {
  BALANCE = "/balance",
  NFT = "/nft",
}

export type OracleRequest = {
  route: OracleRoute;
  args: any[];
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
  type: "text" | "number" | "textarea";
  label: string;
  placeholder: string;
};

export type StatementChoice = {
  route: OracleRoute;
  name: string;
  description: string;
  args: HTMLInputSchema[];
  possibleConditions: Condition[];
};

export const StatementChoices: StatementChoice[] = [
  {
    route: OracleRoute.BALANCE,
    name: "Balance",
    description: "Statement on a target ERC20 token balance",
    args: [
      {
        type: "text",
        label: "Target ERC20 Token Address",
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
    route: OracleRoute.NFT,
    name: "NFT",
    description: "Statement on a target ERC721 token balance",
    args: [
      {
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
];
