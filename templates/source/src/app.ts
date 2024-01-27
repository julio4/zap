import express, { Express } from "express";
import endpoints from "./endpoints/index.js";
import {
  minaAddress,
  validationErrorHandler,
} from "./middlewares/paramsValidations.js";
import { zapMiddleware } from "./middlewares/zapMiddleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger-output.json" assert { type: "json" };

const app: Express = express();

app.use(express.json());
app.use(zapMiddleware);

app.use("/api", minaAddress, endpoints);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(validationErrorHandler);

export default app;
