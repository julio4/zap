import express, { Router } from "express";
import { getListBalances, getListNFTs } from "../controllers/listController.js";
import { validateParams } from "../middlewares/paramsValidations.js";

const router: Router = express.Router();

router.post("/listBalances", validateParams, getListBalances);
router.post("/listNFTs", validateParams, getListNFTs);

export default router;
