import { AttestContext } from "../provider/attest.js";
import { useContext } from "react";

/**
 * Function that submits the zero-knowledge statement verification proof to the ZAP protocol on Mina
 * @param verificationTxJson the statement verification transaction json obtained from `verifyTransaction()`
 * @param attestationHashBase64 the statement validity attestation note obtained from `verifyTransaction()`
 * @returns hash of the proof submission transaction to the ZAP protocol on Mina
 */
// shouldn't it be a custom hook in order to import useContext ??
export const submitProof = async (
  verificationTxJson: string,
  attestationHashBase64: string
) => {
  const attest = useContext(AttestContext);

  if (verificationTxJson === null || attestationHashBase64 === null) {
    console.log("verificationTxJson or attestationHashBase64 is null");
    return;
  }

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
    console.error(
      "Error sending transaction: " +
        (error as Error).message +
        "\n Please try again."
    );
  }
};

declare global {
  interface Window {
    mina: any;
  }
}

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
