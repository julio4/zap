import { useAttestationStore } from './storeProof.js';
import { useContext } from 'react';
import { AttestContext } from '../provider/attest.js';

/**
 * Function that submits the zero-knowledge statement verification proof to the ZAP protocol on Mina
 * @param verificationTxJson the statement verification transaction json obtained from `verifyTransaction()`
 * @param attestationHashBase64 the statement validity attestation note obtained from `verifyTransaction()`
 * @returns hash of the proof submission transaction to the ZAP protocol on Mina
 */
export const useSubmitProof = () => {
  const attest = useContext(AttestContext);
  const addNote = useAttestationStore((state) => state.addAttestationNote);

  const submitProof = async (verificationTxJson: string, attestationHashBase64: string) => {
    if (!verificationTxJson || !attestationHashBase64) {
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
      addNote(attestationHashBase64);

      return { hash };
    } catch (error: any) {
      console.error("Error sending transaction: " + error.message + "\n Please try again.");
    }
  };

  return submitProof;
};
