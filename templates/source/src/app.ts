import express, { Express } from "express";
import endpoints from "./endpoints"
import { minaAddress, validationErrorHandler } from "./middleware/paramsValidations";

const app: Express = express();

app.use(express.json());

app.use("/api", minaAddress, endpoints);

app.use(validationErrorHandler);

export default app;
