import { PrivateKey, Signature } from "o1js";
import { ZapResponse, ZapHashedResponse, ZapSignedResponse } from "@zap/types";
import { encodeResAsFields, hashRoute } from "@zap/shared";

export const hashResponse = (res: ZapResponse): ZapHashedResponse => ({
  value: res.value,
  hashRoute: hashRoute(res.route).toString(),
});

export const signResponse = (
  res: ZapResponse,
  privateKey: PrivateKey
): ZapSignedResponse => {
  const publicKey = privateKey.toPublicKey().toBase58();

  // Compute the hash of the route and format the response data
  const data = hashResponse(res);

  const signature = Signature.create(
    privateKey,
    encodeResAsFields(data)
  ).toBase58();

  return {
    data,
    signature,
    publicKey,
  };
};
