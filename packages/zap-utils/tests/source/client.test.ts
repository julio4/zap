import {
  signResponse,
  hashRoute,
  verifyResponseSignature,
} from "../../src/index.js";
import { PrivateKey } from "o1js";
import { ZapResponse } from "types.js";

describe("Source client", () => {
  const res: ZapResponse = {
    value: 10,
    route: {
      path: "/path",
      args: {
        id: "id",
      },
    },
  };

  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  const signedRes = signResponse(res, privateKey);

  it("verifyResponseSignature", () => {
    expect(verifyResponseSignature(signedRes, publicKey)).toBeTruthy();
  });

  it("verifyResponseSignature with wrong public key", () => {
    expect(
      verifyResponseSignature(signedRes, PrivateKey.random().toPublicKey())
    ).toBeFalsy();
  });

  it("verifyResponseSignature with wrong private key", () => {
    const signedResWithWrongPrivateKey = signResponse(res, PrivateKey.random());
    expect(
      verifyResponseSignature(signedResWithWrongPrivateKey, publicKey)
    ).toBeFalsy();
  });

  it("verifyResponseSignature with wrong value", () => {
    const signedResWithWrongValue = {
      ...signedRes,
      data: {
        ...signedRes.data,
        value: res.value + 1,
      },
    };
    expect(
      verifyResponseSignature(signedResWithWrongValue, publicKey)
    ).toBeFalsy();
  });

  it("verifyResponseSignature with wrong route path", () => {
    const signedResWithWrongRoutePath = {
      ...signedRes,
      data: {
        ...signedRes.data,
        hashRoute: hashRoute({
          ...res.route,
          path: "/wrong",
        }).toString(),
      },
    };
    expect(
      verifyResponseSignature(signedResWithWrongRoutePath, publicKey)
    ).toBeFalsy();
  });

  it("verifyResponseSignature with wrong route args", () => {
    const signedResWithWrongRouteArgs = {
      ...signedRes,
      data: {
        ...signedRes.data,
        hashRoute: hashRoute({
          ...res.route,
          args: {
            id: "wrong",
          },
        }).toString(),
      },
    };
    expect(
      verifyResponseSignature(signedResWithWrongRouteArgs, publicKey)
    ).toBeFalsy();
  });

  it("verifyResponseSignature with missing route args", () => {
    const signedResWithMissingRouteArgs = {
      ...signedRes,
      data: {
        ...signedRes.data,
        hashRoute: hashRoute({
          ...res.route,
          args: {
            other: "other",
          },
        }).toString(),
      },
    };
    expect(
      verifyResponseSignature(signedResWithMissingRouteArgs, publicKey)
    ).toBeFalsy();
  });
});
