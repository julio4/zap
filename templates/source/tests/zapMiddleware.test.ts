import request from "supertest";
import app from "../src/app.js";
import { PrivateKey } from "o1js";
import { hashRoute, verifyResponseSignature } from "@zap/utils";

import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@zap/utils";

describe("ZapMiddleware (With test endpoint /api/example/nb)", () => {
  let privateKey: PrivateKey;

  beforeAll(async () => {
    // Generate a random private key and set it as the environment variable
    privateKey = PrivateKey.random();
    process.env.PRIVATE_KEY = privateKey.toBase58();
  });

  const path = "/api/example/nb";

  const req = {
    mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    args: { id: 1 },
  } as ZapRequestParams;

  describe("ZapRequest Parameters validation", () => {
    const empty = { ...req, mina_address: "" } as ZapRequestParams;
    const wrong = { ...req, mina_address: "wrong_address" } as ZapRequestParams;
    const good = req;

    it("mina_address missing", async () => {
      const res = await request(app).post(path).send(empty);
      expect(res.status).toBe(400);
      expect(res.text).toContain("mina_address is required");
    });

    it("mina_address wrong address", async () => {
      const res = await request(app).post(path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain("mina_address must be a valid mina address");
    });

    it("mina_address good", async () => {
      const res = await request(app).post(path).send(good);
      expect(res.status).toBe(200);
    });
  });

  describe("Signature verification", () => {
    it("Response with associated public key", async () => {
      const res = await request(app).post(path).send(req);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("publicKey");
      expect(res.body.publicKey).toBe(privateKey.toPublicKey().toBase58());
    });

    it("Response with hashed route", async () => {
      const route: Route = {
        path,
        args: req.args,
      };

      const res = await request(app).post(path).send(req);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("hashRoute");
      expect(res.body.data.hashRoute).toBe(hashRoute(route).toString());
    });

    it("Verify response signature", async () => {
      const res = await request(app).post(path).send(req);
      const body = res.body as ZapSignedResponse;

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(true);
    });

    it("Verify response signature fail with modified value", async () => {
      const res = await request(app).post(path).send(req);
      let body = res.body as ZapSignedResponse;

      // Modify the returned value
      body.data.value += 1;

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(false);
    });

    it("Verify response signature fail with modified route path", async () => {
      const res = await request(app).post(path).send(req);
      let body = res.body as ZapSignedResponse;

      // Modify the returned route args
      const route: Route = {
        path: "/api/example/fake",
        args: req.args,
      };
      body.data.hashRoute = hashRoute(route).toString();

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(false);
    });

    it("Verify response signature fail with modified route args", async () => {
      const res = await request(app).post(path).send(req);
      let body = res.body as ZapSignedResponse;

      // Modify the returned route
      const route: Route = {
        path,
        args: {
          id: req.args?.id + 1,
        },
      };
      body.data.hashRoute = hashRoute(route).toString();

      let result = verifyResponseSignature(body, privateKey.toPublicKey());
      expect(result).toBe(false);
    });
  });
});
