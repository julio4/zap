import "dotenv/config";
import request from "supertest";
import app from "../../../src/app.js";

describe("Endpoint /list/balances", () => {
  const reqBody = {
    mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    args: {
      address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    },
  };
  const routePath = "/api/list/balances";

  describe("Parameters validations", () => {
    it("missing arg.address", async () => {
      const missing = { ...reqBody, args: {} };
      const res = await request(app).post(routePath).send(missing);
      expect(res.status).toBe(400);
      expect(res.text).toContain("arg.address is required");
    });

    it("wrong arg.address", async () => {
      const wrong = { ...reqBody, args: { address: "wrong" } };
      const res = await request(app).post(routePath).send(wrong);
      expect(res.status).toBe(400);
      expect(res.text).toContain(
        "arg.address must be a valid ethereum address"
      );
    });
  });

  it("Return list", async () => {
    const res = await request(app).post(routePath).send(reqBody);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.any(Array));
  });
});
