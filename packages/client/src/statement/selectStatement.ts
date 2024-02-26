import { PublicKey } from "o1js";
import { useContext } from "react";
import { ZapSignedResponse, Statement } from "@zap/types";
import { hashRoute } from "@zap/core";

import { verifyResponseSignature } from "../source.js";
import { AttestContext } from "../provider/attest.js";
import { SignatureVerificationError } from "errors/statement/signatureVerification.js";
import { HashRouteVerificationError } from "errors/statement/hashRouteVerification.js";

export const verifyRouteHash = (
  statement: Statement,
  sourceRouteHash: string
): boolean => sourceRouteHash !== hashRoute(statement.route).toString();

/**
 * This function verifies the source's 1) response signature 2) hashed route.
 * @param statement The statement the client is proving
 * @param sourceResponse The response from the source call
 * @param sourcePublicKey The source's public key the client has
 */
// shouldn't it be a custom hook in order to import useContext ??
export const selectStatement = (
  statement: Statement,
  sourceResponse: ZapSignedResponse,
  sourcePublicKey: string
) => {
  const attest = useContext(AttestContext);

  // We can first verify here but really the most important is to verify within the proof

  const publicKey = PublicKey.fromBase58(sourcePublicKey);
  if (!verifyResponseSignature(sourceResponse, publicKey))
    throw new SignatureVerificationError();

  const sourceRouteHash = sourceResponse.data.hashRoute;
  if (!verifyRouteHash(statement, sourceRouteHash))
    throw new HashRouteVerificationError();

  // States changes
  attest.setStatement(statement);
  attest.setPrivateData(sourceResponse);
};
