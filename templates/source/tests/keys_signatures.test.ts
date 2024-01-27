import request from "supertest";
import app from "../src/app.js";
import { PrivateKey } from "o1js";
import { hashRoute, verifyResponseSignature } from "@packages/zap-utils";

import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@packages/zap-utils";

describe("Key signature (With test endpoint /example/nb)", () => {
  let privateKey: PrivateKey;

  beforeAll(async () => {
    // Generate a random private key and set it as the environment variable
    privateKey = PrivateKey.random();
    process.env.PRIVATE_KEY = privateKey.toBase58();
  });

  const req = {
    mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    args: { id: 1 },
  } as ZapRequestParams;

  it("Response with associated public key", async () => {
    const res = await request(app).post("/api/example/nb").send(req);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("publicKey");
    expect(res.body.publicKey).toBe(privateKey.toPublicKey().toBase58());
  });

  it("Response with hashed route", async () => {
    const route: Route = {
      path: "/api/example/nb",
      args: req.args,
    };

    const res = await request(app).post("/api/example/nb").send(req);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("hashRoute");
    expect(res.body.data.hashRoute).toBe(hashRoute(route).toString());
  });

  it("Verify response signature", async () => {
    const res = await request(app).post("/api/example/nb").send(req);
    const body = res.body as ZapSignedResponse;

    let result = verifyResponseSignature(body, privateKey.toPublicKey());
    expect(result).toBe(true);
  });

  it("Verify response signature fail with modified value", async () => {
    const res = await request(app).post("/api/example/nb").send(req);
    let body = res.body as ZapSignedResponse;

    // Modify the returned value
    body.data.value += 1;

    let result = verifyResponseSignature(body, privateKey.toPublicKey());
    expect(result).toBe(false);
  });

  it("Verify response signature fail with modified route path", async () => {
    const res = await request(app).post("/api/example/nb").send(req);
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
    const res = await request(app).post("/api/example/nb").send(req);
    let body = res.body as ZapSignedResponse;

    // Modify the returned route
    const route: Route = {
      path: "/api/example/nb",
      args: {
        id: req.args?.id + 1,
      },
    };
    body.data.hashRoute = hashRoute(route).toString();

    let result = verifyResponseSignature(body, privateKey.toPublicKey());
    expect(result).toBe(false);
  });
});
