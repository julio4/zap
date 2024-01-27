import "dotenv/config";
import request from "supertest";
import app from "../../../src/app.js";
import { PrivateKey } from "o1js";
import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@packages/zap-utils";
import { verifyResponseSignature } from "@packages/zap-utils";
import { ethers } from "ethers";

describe("Endpoint /evm/poap", () => {
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
        poapId: 1234,
      },
    };
    route = {
      path: "/api/evm/poap",
      args: reqBody.args,
    };
  });

  describe("Parameters validations", () => {
    it("missing arg.poapId", async () => {
      const missing = { ...reqBody, args: { ...reqBody.args, poapId: "" } };
      const res = await request(app).post(route.path).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("arg.poapId is required");
    });

    it("wrong arg.poapId", async () => {
      const wrong = { ...reqBody, args: { ...reqBody.args, poapId: "wrong" } };
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain("arg.poapId must be a valid poap id");
    });
  });

  it("Call success", async () => {
    const res = await request(app).post(route.path).send(reqBody);
    const body: ZapSignedResponse = res.body;
    expect(verifyResponseSignature(body, privateKey.toPublicKey())).toBe(true);
    expect(body.data.value).toEqual(expect.any(Number));
  });
});
