import "dotenv/config";
import request from "supertest";
import app from "../../../src/app.js";
import { PrivateKey } from "o1js";
import {
  Route,
  ZapRequestParams,
  ZapSignedResponse,
} from "@zap/utils";
import { verifyResponseSignature } from "@zap/utils";
import { ethers } from "ethers";

describe("Endpoint /evm/ens", () => {
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

  // No params validations (address and signature are tested in EvmMiddleware.test.ts)

  it("Call success", async () => {
    const res = await request(app).post(route.path).send(reqBody);
    const body: ZapSignedResponse = res.body;
    expect(verifyResponseSignature(body, privateKey.toPublicKey())).toBe(true);
    expect(body.data.value).toEqual(expect.any(Number));
  });
});
