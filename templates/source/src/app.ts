import express, { Express } from "express";
import endpoints from "./endpoints/index.js";
import { minaAddress, validationErrorHandler } from "./middlewares/paramsValidations.js";
import { zapMiddleware } from "./middlewares/zapMiddleware.js";

const app: Express = express();

app.use(express.json());
app.use(zapMiddleware);

app.use("/api", minaAddress, endpoints);

app.use(validationErrorHandler);

export default app;
