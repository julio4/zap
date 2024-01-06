import express, { Router } from "express";
import {
  ethereumAddressArg,
  validateParams,
} from "../middlewares/paramsValidations.js";
import { zapMiddleware } from "middlewares/zapMiddleware.js";

import evmEndpoints from "./evmEndpoints.js";
import listEndpoints from "./listEndpoints.js";

const router: Router = express.Router();

// This 'hello' endpoint can be used to test the connection to the server
// And the validation rules for all endpoints
router.use("/hello", validateParams, (req, res) => {
  res.send("Hello World!");
});

router.use("/list", ethereumAddressArg, listEndpoints);

// Notice: Only /evm endpoints use ZapMiddleware
router.use(
  "/evm",
  zapMiddleware,
  /* EvmAddressMiddleware, */ ethereumAddressArg,
  evmEndpoints
);

export default router;
