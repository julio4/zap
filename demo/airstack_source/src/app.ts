import express, { Express } from "express";
import endpoints from "./endpoints/index.js";
import {
  minaAddress,
  validationErrorHandler,
} from "./middlewares/paramsValidations.js";

const app: Express = express();

app.use(express.json());

app.use("/api", minaAddress, endpoints);

app.use(validationErrorHandler);

export default app;
