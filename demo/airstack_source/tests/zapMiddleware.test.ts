import request from "supertest";
import app from "../src/app.js";
import { PrivateKey } from "o1js";
import { hashRoute } from "@zap/source";
import { verifyResponseSignature } from "@zap/client";

import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@zap/types";
import { ethers } from "ethers";

// We will use basic endpoint /evm/ens to test the middleware
// Refers to ./endpoints/evm/ens.test.ts for further details

describe("ZapMiddleware (With test endpoint /evm/ens)", () => {
  let reqBody: ZapRequestParams;
  let route: Route;
  let wallet: ethers.HDNodeWallet;
  let privateKey: PrivateKey;

  beforeAll(async () => {
    // Generate a random private key and set it as the environment variable
    privateKey = PrivateKey.random();
    process.env.PRIVATE_KEY = privateKey.toBase58();

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

  describe("ZapRequest Parameters validation", () => {
    it("mina_address missing", async () => {
      const empty = { ...reqBody, mina_address: "" } as ZapRequestParams;
      const res = await request(app).post(route.path).send(empty);
      expect(res.status).toBe(400);
      expect(res.text).toContain("mina_address is required");
    });

    it("mina_address wrong address", async () => {
      const wrong = {
        ...reqBody,
        mina_address: "wrong_address",
      } as ZapRequestParams;
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain("mina_address must be a valid mina address");
    });

    it("mina_address good", async () => {
      const good = reqBody;
      const res = await request(app).post(route.path).send(good);
      expect(res.status).toBe(200);
    });
  });

  describe("Signature verification", () => {
    it("Response with associated public key", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("publicKey");
      expect(res.body.publicKey).toBe(privateKey.toPublicKey().toBase58());
    });

    it("Response with hashed route", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("hashRoute");
      expect(res.body.data.hashRoute).toBe(hashRoute(route).toString());
    });

    it("Verify response signature", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      const body = res.body as ZapSignedResponse;

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(true);
    });

    it("Verify response signature fail with modified value", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      let body = res.body as ZapSignedResponse;

      // Modify the returned value
      body.data.value += 1;

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(false);
    });

    it("Verify response signature fail with modified route path", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      let body = res.body as ZapSignedResponse;

      // Modify the returned route path
      const fakeRoute: Route = {
        path: "/api/some/fake",
        args: reqBody.args,
      };
      body.data.hashRoute = hashRoute(fakeRoute).toString();

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(false);
    });

    it("Verify response signature fail with modified route args", async () => {
      const res = await request(app).post(route.path).send(reqBody);
      let body = res.body as ZapSignedResponse;

      // Modify the returned route args
      const fakeRoute: Route = {
        path: route.path,
        args: {
          id: 2,
        },
      };
      body.data.hashRoute = hashRoute(fakeRoute).toString();

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(false);
    });
  });
});
