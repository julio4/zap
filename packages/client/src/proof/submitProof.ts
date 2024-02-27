import { useMutation } from "@tanstack/react-query";
import { AttestContext } from "../provider/attest.js";
import { useContext } from "react";
import { VerificationTxJsonError } from "errors/proof/submitProof/verificationTxJson.js";
import { AttestationHashBase64Error } from "errors/proof/submitProof/attestationHashBase64.js";
import { SendingProofError } from "errors/proof/submitProof/sendingProof.js";

/**
* Custom hook that submits the zero-knowledge statement verification proof to the ZAP protocol on Mina
 * @param verificationTxJson the statement verification transaction json obtained from `verifyTransaction()`
 * @param attestationHashBase64 the statement validity attestation note obtained from `verifyTransaction()`
 * @returns hash of the proof submission transaction to the ZAP protocol on Mina
 * @throws SubmitProofError
 */
export const useSubmitProof = (
  verificationTxJson: string,
  attestationHashBase64: string
) => {
  return useMutation({
    mutationFn: () => submitProof(verificationTxJson, attestationHashBase64),
  });
};

// shouldn't it be a custom hook in order to use useContext ??
const submitProof = async (
  verificationTxJson: string,
  attestationHashBase64: string
) => {
  const attest = useContext(AttestContext);

  if (verificationTxJson === null) throw new VerificationTxJsonError();

  if (attestationHashBase64 === null) throw new AttestationHashBase64Error();

  try {
    const { hash } = await window.mina.sendTransaction({
      transaction: verificationTxJson,
      feePayer: {
        fee: 0.1,
        memo: "",
      },
    });

    attest.setFinalResult(attestationHashBase64);
    addAttestationNoteToLocalStorage(attestationHashBase64);

    return {
      hash,
    };
  } catch (error) {
    throw new SendingProofError((error as Error).message);
  }
};

// Save attestation note to local storage
const addAttestationNoteToLocalStorage = (newNote: string): boolean => {
  try {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    const noteWithDate = `${formattedDate}: ${newNote}`;

    const existingNotesString = localStorage.getItem("attestationNotes");
    const existingNotes: string[] = existingNotesString
      ? JSON.parse(existingNotesString)
      : [];

    existingNotes.push(noteWithDate);
    localStorage.setItem("attestationNotes", JSON.stringify(existingNotes));

    return true;
  } catch (error) {
    console.error("Error updating localStorage", error);

    return false;
  }
};
