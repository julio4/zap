import { calculateAttestationHash, getConditionString } from "@zap/shared";
import { AttestationNote, Statement } from "@zap/types";
import { Field } from "o1js";
import { AttestContext } from "../provider/attest.js";
import { useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import { UndefinedFieldError } from "errors/proof/verifyAndProveStatement/undefinedField.js";

/**
 * This function:
 * - verifies the statement using ZAP protocol
 * - generates the attestation/proof
 */
export const useVerifyAndProveStatement = () => {
  return useMutation({
    mutationFn: verifyAndProveStatement,
  });
}

// shouldn't it be a custom hook in order to import useContext ??
const verifyAndProveStatement = async () => {
  const attest = useContext(AttestContext);

  if (!attest.workerClient)
    throw new UndefinedFieldError("workerClient");

  const { minaWallet } = attest;
  if (!minaWallet)
    throw new UndefinedFieldError("minaWallet");

  // might be useless as creatingTransaction is never read
  attest.set({ ...attest, creatingTransaction: true });

  if (attest.privateData === null)
    throw new UndefinedFieldError("privateData");

    if (attest.statement === null)
    throw new UndefinedFieldError("statement");

  await attest.workerClient.createVerifyTransaction(
    attest.statement,
    Field.from(attest.privateData.data.value).toJSON(),
    attest.privateData.signature
  );

  await attest.workerClient.proveTransaction();

  const txJson = await attest.workerClient.getTransactionJSON();
  // setTransactionJSON(txJson as string); // maybe pass stateUpdateFn from frontend to this fct

  const attestationHash = calculateAttestationHash(
    attest.statement.condition.type,
    attest.privateData.data.hashRoute,
    attest.statement.condition.targetValue,
    attest.minaWallet.address
  );

  // could maybe set the note as a variable in attest context
  const attestationNoteBase64 = createAttestationNoteEncoded(
    attest.statement,
    attest.privateData.data.hashRoute,
    attestationHash,
    attest.minaWallet.address
  );

  return {
    verificationTransactionJson: txJson,
    attestationNoteBase64,
  };
};

const createAttestationNoteEncoded = (
  statement: Statement,
  hashRoute: string,
  attestationHash: string,
  sender: string
): string => {
  const operation = getConditionString(statement.condition.type);
  const attestation: AttestationNote = {
    attestationHash,
    statement: `I, ${sender}, attest that my value is ${operation} ${
      statement.condition.targetValue
    } for ${statement.route.path} with args: ${JSON.stringify(
      statement.route.args
    )}.`,
    targetValue: statement.condition.targetValue,
    conditionType: statement.condition.type,
    hashRoute,
    sender,
  };

  return noteToBase64(attestation);
};

const noteToBase64 = (note: AttestationNote): string => {
  const jsonString = JSON.stringify(note);

  return Buffer.from(jsonString).toString("base64");
};
