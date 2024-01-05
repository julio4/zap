import { Request, Response } from "express";
import AirstackService from "../services/airstackService.js";
import { SupportedValue, ZapRequestParams } from "@packages/zap-utils/types";

export const getUserBalance = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const getUserNftVolumeSales = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const verifyEnsHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const verifyFarcasterHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const verifyLensHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const verifyNftHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const verifyPoapHolder = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};

export const verifyXMTPenabled = async (
  req: Request<ZapRequestParams>,
  res: Response<SupportedValue>
) => {};
