import express, { Express, Request, Response } from "express";
import bodyParser from 'body-parser';
import endpoints from "./endpoints"

const app: Express = express();

app.use(express.json());
app.use(bodyParser.json());

app.use("/api", endpoints);

export default app;
