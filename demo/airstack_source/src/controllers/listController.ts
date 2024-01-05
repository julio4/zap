import { Request, Response } from "express";
import AirstackService from "../services/airstackService.js";
import { SupportedValue, ZapRequestParams } from "@packages/zap-utils/types";
import { ERC20TokenBalance } from "services/airstack/types.js";

export const getListBalances = async (
  req: Request<ZapRequestParams>,
  res: Response<[ERC20TokenBalance[], ERC20TokenBalance[]]>
) => {
  const { address } = req.body.args;
  const tokens = await AirstackService.getAllTokens(address);
  res.json(tokens);
};

export const getListNFTs = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};
