import "dotenv/config";
import request from "supertest";
import app from "../src/app.js";
import { PrivateKey } from "o1js";
import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@zap/utils";
import { verifyResponseSignature } from "@zap/utils";
import { ethers } from "ethers";

// We will use basic endpoint /evm/ens to test the middleware
// Refers to ./endpoints/evm/ens.test.ts for further details

describe("EvmMiddleware", () => {
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
      },
    };
    route = {
      path: "/api/evm/ens",
      args: reqBody.args,
    };
  });

  describe("Parameters validations", () => {
    it("missing args.address", async () => {
      const missing = { ...reqBody, args: { ...reqBody.args, address: "" } };
      const res = await request(app).post(route.path).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("args.address is required");
    });

    it("wrong args.address", async () => {
      const wrong = { ...reqBody, args: { ...reqBody.args, address: "wrong" } };
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain(
        "args.address must be a valid ethereum address"
      );
    });

    it("missing args.signature", async () => {
      const missing = { ...reqBody, args: { ...reqBody.args, signature: "" } };
      const res = await request(app).post(route.path).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("args.signature is required");
    });

    it("wrong args.signature", async () => {
      const wrong = {
        ...reqBody,
        args: { ...reqBody.args, signature: "wrong" },
      };
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain(
        "args.signature must be a valid ethereum message signature"
      );
    });
  });

  describe("Verify Signature", () => {
    it("falsy message signature", async () => {
      const falsy = {
        ...reqBody,
        args: {
          ...reqBody.args,
          signature: await wallet.signMessage(`I am not ${wallet.address}`),
        },
      };
      const res = await request(app).post(route.path).send(falsy);
      expect(res.status).toBe(401);
      expect(res.text).toContain("Invalid signature");
    });

    it("falsy signer signature", async () => {
      const falsyWallet = ethers.Wallet.createRandom();
      expect(falsyWallet.address).not.toBe(wallet.address);

      const falsy = {
        ...reqBody,
        args: {
          ...reqBody.args,
          signature: await falsyWallet.signMessage(`I am ${wallet.address}`),
        },
      };
      const res = await request(app).post(route.path).send(falsy);
      expect(res.status).toBe(401);
      expect(res.text).toContain("Invalid signature");
    });

    it("different args.address and signer address", async () => {
      const falsyWallet = ethers.Wallet.createRandom();
      expect(falsyWallet.address).not.toBe(wallet.address);

      const falsy = {
        ...reqBody,
        args: {
          ...reqBody.args,
          address: falsyWallet.address,
        },
      };
      const res = await request(app).post(route.path).send(falsy);
      expect(res.status).toBe(401);
      expect(res.text).toContain("Invalid signature");
    });

    // Depends on both ZapMiddleware and /evm/ens tests
    it("Call success with correct signature", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      const body: ZapSignedResponse = res.body;
      expect(verifyResponseSignature(body, privateKey.toPublicKey())).toBe(
        true
      );
      expect(body.data.value).toEqual(expect.any(Number));
    });
  });
});
