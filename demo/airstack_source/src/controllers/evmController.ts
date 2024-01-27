import { Request, Response } from "express";
import AirstackService from "../services/airstackService.js";
import { SupportedValue, ZapRequestParams } from "@packages/zap-utils";

export const getUserBalance = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address, token, blockchain } = req.body.args;
  const balance = await AirstackService.getBalance(address, token, blockchain);
  res.json(balance);
};

export const getUserNftVolumeSales = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address } = req.body.args;
  const volume = await AirstackService.getNftSaleVolume(address);
  res.json(volume);
};

export const verifyEnsHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address } = req.body.args;
  const ens = await AirstackService.isEnsHolder(address);
  res.json(ens);
};

export const verifyFarcasterHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address } = req.body.args;
  const farcaster = await AirstackService.isFarcasterHolder(address);
  res.json(farcaster);
};

export const verifyLensHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address } = req.body.args;
  const lens = await AirstackService.isLensHolder(address);
  res.json(lens);
};

export const verifyNftHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address, nftAddress, blockchain } = req.body.args;
  const nft = await AirstackService.isNftHolder(
    address,
    nftAddress,
    blockchain
  );
  res.json(nft);
};

export const verifyPoapHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address, poapId } = req.body.args;
  const poap = await AirstackService.isPoapHolder(address, poapId);
  res.json(poap);
};

export const verifyXMTPenabled = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {
  const { address } = req.body.args;
  const xmtp = await AirstackService.isXMTPenabled(address);
  res.json(xmtp);
};
