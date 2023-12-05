import request from "supertest";
import app from "../src/app"; // Adjust the path accordingly

describe("Core", () => {
  it("mina_address missing", async () => {
    const res = await request(app).get("/api").send({});
    expect(res.status).toBe(400);
    expect(res.text).toContain("mina_address is required");
  });

  it("mina_address wrong address", async () => {
    const res = await request(app).get("/api").send({
      mina_address: "wrong_address",
    });
    expect(res.status).toBe(400);
    expect(res.text).toContain("mina_address must be a valid mina address");
  });

  it("mina_address good", async () => {
    const res = await request(app).get("/api").send({
      mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    });
    expect(res.status).toBe(200);
  });
});
