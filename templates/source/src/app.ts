import express, { Express } from "express";
import endpoints from "./endpoints"
import { minaAddress, validationErrorHandler } from "./middlewares/paramsValidations";
import { zapMiddleware } from "./middlewares/zapMiddleware";

const app: Express = express();

app.use(express.json());
app.use(zapMiddleware);

app.use("/api", minaAddress, endpoints);

app.use(validationErrorHandler);

export default app;
