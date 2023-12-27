import request from "supertest";
import app from "../src/app.js";
import { ZapRequestParams } from "@packages/zap-utils/types";

// Test that a valid mina address is required
// Each request will be signed for a target address
describe("ZapRequest Parameters validation", () => {
  const empty = {} as ZapRequestParams;
  const wrong = { mina_address: "wrong_address" } as ZapRequestParams;
  const good = {
    mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  } as ZapRequestParams;

  it("mina_address missing", async () => {
    const res = await request(app).get("/api/hello").send(empty);
    expect(res.status).toBe(400);
    expect(res.text).toContain("mina_address is required");
  });

  it("mina_address wrong address", async () => {
    const res = await request(app).get("/api/hello").send(wrong);
    expect(res.status).toBe(400);
    expect(res.text).toContain("mina_address must be a valid mina address");
  });

  it("mina_address good", async () => {
    const res = await request(app).get("/api/hello").send(good);
    expect(res.status).toBe(200);
  });
});
