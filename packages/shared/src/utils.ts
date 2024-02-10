import { KeyPair } from "@zap/types";
import { PrivateKey, PublicKey } from "o1js";

export const generateKeyPair = (): KeyPair => {
  const privateKey: PrivateKey = PrivateKey.random();
  const publicKey: PublicKey = privateKey.toPublicKey();
  return { privateKey, publicKey };
}
