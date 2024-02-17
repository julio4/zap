import { Signature, PublicKey } from "o1js";
import { ZapSignedResponse } from "@zap/types";
import { encodeResAsFields } from "@zap/shared";

export const verifyResponseSignature = (
  res: ZapSignedResponse,
  publicKey: PublicKey
): boolean => {
  const data = encodeResAsFields(res.data);
  const signature = Signature.fromBase58(res.signature);

  return signature.verify(publicKey, data).toBoolean();
};
