import express, { Router } from "express";
import { getNumber } from "../controllers/exampleController.js";
import { idArg, validateParams } from "../middlewares/paramsValidations.js";

const router: Router = express.Router();

router.post("/nb", idArg, validateParams, getNumber);

export default router;
