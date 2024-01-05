import "dotenv/config";
import request from "supertest";
import app from "../../../src/app.js";
import { PrivateKey } from "o1js";
import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@packages/zap-utils/types";
import { verifyResponseSignature } from "@packages/zap-utils";

// Example of tests for the /example/nb endpoint
describe("Endpoint /example/nb", () => {
  const reqBody: ZapRequestParams = {
    mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    args: {
      id: 10,
    },
  };
  const route: Route = {
    path: "/api/example/nb",
    args: reqBody.args,
  };

  let privateKey: PrivateKey;
  beforeAll(() => {
    if (!process.env.PRIVATE_KEY)
      throw new Error("Missing PRIVATE_KEY env variable");
    privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY);
  });

  describe("Parameters validations", () => {
    it("missing arg.id", async () => {
      const missing = { ...reqBody, args: {} };
      const res = await request(app).post(route.path).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("arg.id is required");
    });

    it("wrong arg.id", async () => {
      const wrong = { ...reqBody, args: { id: "wrong" } };
      const res = await request(app).post(route.path).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain("arg.id must be an integer");
    });

    it("good", async () => {
      const good = { ...reqBody, args: { id: 1 } };
      const res = await request(app).post(route.path).send(good);
      expect(res.status).toBe(200);
    });
  });

  it("Return signed number", async () => {
    const res = await request(app).post(route.path).send(reqBody);
    const body: ZapSignedResponse = res.body;

    expect(verifyResponseSignature(body, privateKey.toPublicKey())).toBe(true);
    expect(body.data.value).toEqual(expect.any(Number));
  });

  // Add more tests from here to test the endpoint for more complex ones
});
