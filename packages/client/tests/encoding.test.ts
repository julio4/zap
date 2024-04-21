import { PrivateKey } from "o1js";
import {
  generateBase64Attestation,
  decodeBase64Attestation,
} from "../src/index.js";
import { Route } from "@zap/types";
import { hashRoute } from "@zap/shared";

describe("Encoding", () => {
  describe("Base64 Attestation note", () => {
    const route: Route = {
      path: "/balance/:0xdac17f958d2ee523a2206206994597c13d831ec7",
      args: {},
    };
    const conditionType = "==";
    const targetValue = 100;
    const senderPrivateKey = PrivateKey.random();
    const senderPublicKey = senderPrivateKey.toPublicKey();

    it("generateBase64Attestation", () => {
      const base64Attestation = generateBase64Attestation(
        hashRoute(route),
        conditionType,
        targetValue,
        senderPublicKey
      );
      expect(base64Attestation).toBeDefined();
    });

    it("decodeBase64Attestation", () => {
      const hRoute = hashRoute(route);
      const base64Attestation = generateBase64Attestation(
        hRoute,
        conditionType,
        targetValue,
        senderPublicKey
      );

      const decodedAttestation = decodeBase64Attestation(base64Attestation);
      expect(decodedAttestation).toBeDefined();
      expect(decodedAttestation.hashRoute.toString()).toEqual(
        hRoute.toString()
      );
      expect(decodedAttestation.conditionType).toEqual(conditionType);
      expect(decodedAttestation.targetValue).toEqual(targetValue);
      expect(decodedAttestation.sender.toBase58()).toEqual(
        senderPublicKey.toBase58()
      );
    });
  });
});
