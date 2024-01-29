import "dotenv/config";
import request from "supertest";
import app from "../../../src/app.js";
import { PrivateKey } from "o1js";
import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@zap/types";
import { verifyResponseSignature } from "@zap/client";
import { ethers } from "ethers";

const USDT_CONTRACT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";

describe("Endpoint /evm/balance", () => {
  let reqBody: ZapRequestParams;
  let route: Route;
  let wallet: ethers.HDNodeWallet;
  let privateKey: PrivateKey;

  beforeAll(async () => {
    if (!process.env.PRIVATE_KEY)
      throw new Error("Missing PRIVATE_KEY env variable");
    privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY);

    wallet = ethers.Wallet.createRandom();
    // Generate a signed message of `I am ${wallet.address}`
    const signedMessage = await wallet.signMessage(`I am ${wallet.address}`);

    reqBody = {
      mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      args: {
        address: wallet.address,
        signature: signedMessage,
        token: USDT_CONTRACT_ADDRESS,
        blockchain: "ethereum",
      },
    };
    route = {
      path: "/api/evm/balance",
      args: reqBody.args,
    };
  });

  describe("Parameters validations", () => {
    it("missing args.token", async () => {
      const missing = { ...reqBody, args: { ...reqBody.args, token: "" } };
      const res = await request(app).post(route.path).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("args.token is required");
    });

    it("wrong args.token", async () => {
      const wrong = { ...reqBody, args: { ...reqBody.args, token: "wrong" } };
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain("args.token must be a valid ethereum address");
    });

    it("missing args.blockchain", async () => {
      const missing = { ...reqBody, args: { ...reqBody.args, blockchain: "" } };
      const res = await request(app).post(route.path).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("args.blockchain is required");
    });

    it("wrong args.blockchain", async () => {
      const wrong = {
        ...reqBody,
        args: { ...reqBody.args, blockchain: "wrong" },
      };
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain(
        "args.blockchain must be a supported blockchain"
      );
    });
  });

  it("Call success", async () => {
    const res = await request(app).post(route.path).send(reqBody);
    const body: ZapSignedResponse = res.body;
    expect(verifyResponseSignature(body, privateKey.toPublicKey())).toBe(true);
    expect(body.data.value).toEqual(expect.any(Number));
  });
});
