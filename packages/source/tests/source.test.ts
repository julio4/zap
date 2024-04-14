import { hashResponse, signResponse } from "../src/index.js";
import { Field, PrivateKey, Signature } from "o1js";
import { ZapResponse, Route } from "@zap/types";
import { hashRoute } from "@zap/shared";

describe("Source server", () => {
  const route: Route = {
    path: "/path",
    args: {
      id: "id",
    },
  };
  const value = 10;
  const res: ZapResponse = {
    value,
    route,
  };

  it("hashResponse", () => {
    expect(hashResponse(res)).toStrictEqual({
      value,
      hashRoute: hashRoute(route).toString(),
    });
  });

  it("signResponse", () => {
    const privateKey = PrivateKey.random();
    const publicKey = privateKey.toPublicKey();
    const signedRes = signResponse(res, privateKey);

    expect(signedRes).toStrictEqual({
      data: hashResponse(res),
      signature: Signature.create(
        privateKey,
        [value, hashRoute(route)].map((v) => Field.from(v))
      ).toBase58(),
      publicKey: publicKey.toBase58(),
    });

    const signature = Signature.fromBase58(signedRes.signature);

    expect(
      signature.verify(
        publicKey,
        [signedRes.data.value, signedRes.data.hashRoute].map((v) =>
          Field.from(v)
        )
      )
    ).toBeTruthy();
  });
});
