import express, { Router } from "express";
import {
  getUserBalance,
  getUserNftVolumeSales,
  verifyEnsHolder,
  verifyFarcasterHolder,
  verifyLensHolder,
  verifyNftHolder,
  verifyPoapHolder,
  verifyXMTPenabled,
} from "../controllers/evmController.js";
import { validateParams, erc20AddressArg, blockchainArg } from "../middlewares/paramsValidations.js";

const router: Router = express.Router();

router.post("/balance", erc20AddressArg, blockchainArg, validateParams, getUserBalance);
router.post("/poap", validateParams, verifyPoapHolder);
router.post("/nft", validateParams, verifyNftHolder);
router.post("/xmtpEnabled", validateParams, verifyXMTPenabled);
router.post("/ens", validateParams, verifyEnsHolder);
router.post("/lens", validateParams, verifyLensHolder);
router.post("/farcaster", validateParams, verifyFarcasterHolder);
router.post("/totalNftVolume", validateParams, getUserNftVolumeSales);

export default router;
