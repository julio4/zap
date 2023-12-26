"use client";
import { useContext, useEffect, useState } from "react";
import { AttestContext } from "../context/attestContext";
import { ArgsHashAttestationCalculator, Condition } from "../../types";
import { createAttestationNoteEncoded } from "../../utils/createBase64Attestation";
import { calculateAttestationHash } from "../../utils/calculateAttestationHash";

let transactionFee = 0.1;

const ProofStep = () => {
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [attestationHashBase64, setAttestationHashBase64] = useState<string | null>(null);
  const [transactionJSON, setTransactionJSON] = useState<string | null>(null);
  const [hashTX, setHashTX] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'normal' | 'error'>('normal');
  const [buttonLabel, setButtonLabel] = useState("Generate proof");
  const [errorText, setErrorText] = useState<string | null>(null);
  const attest = useContext(AttestContext);

  let ArgsToGenerateAttestation: {
    senderKey58: string;
    conditionType: Condition;
    targetValue: number;
    value: number;
    hashRoute: string;
    signature: string;
  }

  const onCreateTransaction = async () => {
    if (isCreatingTransaction) {
      return
    }
    setIsCreatingTransaction(true);
    const { zkappWorkerClient } = attest;
    if (!zkappWorkerClient) {
      throw new Error("zkappWorkerClient is not defined");
    }

    const { minaWallet } = attest;
    if (!minaWallet) {
      throw new Error("minaWallet is not defined");
    }

    setMessageType('normal');
    attest.set({ ...attest, creatingTransaction: true });

    if (attest.privateData === null) {
      throw new Error("privateData is not defined");
    }
    if (attest.statement === null) {
      throw new Error("statement is not defined");
    }

    ArgsToGenerateAttestation = {
      senderKey58: attest.minaWallet.address,
      conditionType: attest.statement.condition.type,
      targetValue: attest.statement.condition.targetValue,
      value: attest.privateData.data.value,
      hashRoute: attest.privateData.data.hashRoute,
      signature: attest.privateData.signature,
    };

    if (!attest.zkappWorkerClient) {
      throw new Error("zkappWorkerClient is not defined");
    }

    await attest.zkappWorkerClient.createGenerateAttestationTransaction(ArgsToGenerateAttestation);

    await attest.zkappWorkerClient.proveGenerateAttestationTransaction();

    const txJSON = await attest.zkappWorkerClient.getTransactionJSON();
    setTransactionJSON((txJSON as string));

    const argsToCalculateHash: ArgsHashAttestationCalculator = {
      conditionType: attest.statement.condition.type,
      hashRoute: attest.privateData.data.hashRoute,
      targetValue: attest.statement.condition.targetValue,
      sender: attest.minaWallet.address,

    };
    const hashAttestation = calculateAttestationHash(argsToCalculateHash);

    setAttestationHashBase64(createAttestationNoteEncoded(
      attest.statement.condition.type,
      attest.statement.condition.targetValue,
      attest.privateData.data.value,
      attest.statement.request,
      attest.privateData.data.hashRoute,
      hashAttestation,
      attest.minaWallet.address
    ));

    setMessageType('normal');
    setIsCreatingTransaction(false);
  }

  const onSendTransaction = async () => {
    if (isSendingTransaction) {
      return;
    }
    if (transactionJSON === null || attestationHashBase64 === null) {
      console.log("transactionJSON or attestationHashBase64 is null");
      return;
    }
    setIsSendingTransaction(true);
    try {
      const { hash } = await window.mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          fee: transactionFee,
          memo: '',
        },
      });

      setHashTX(hash);
      setMessageType('normal');
      attest.setFinalResult(attestationHashBase64);
      setIsSendingTransaction(false);
    }

    catch (error) {
      console.log(error)
      setErrorText('Error sending transaction: ' + (error as Error).message + '\n Please try again.');
      setMessageType('error');
      setIsSendingTransaction(false);
      return;
    }
  };

  useEffect(() => {

    if (isCreatingTransaction) {
      setButtonLabel("Creating the proof...");
    }
    else if (isSendingTransaction) {
      setButtonLabel("Sending the transaction...");
    }
    else if (hashTX !== null) {
      setButtonLabel("Transaction sent!");
    }
    else if (errorText !== null) {
      setButtonLabel(errorText);
    }
    else if (transactionJSON !== null) {
      setButtonLabel("Send transaction");
    }
    else {
      setButtonLabel("Generate proof");
    }
  }, [isCreatingTransaction, isSendingTransaction, hashTX, errorText]);

  useEffect(() => {
    if (!isCreatingTransaction && transactionJSON !== null && attestationHashBase64 !== null) {
      onSendTransaction();
    }
  }, [isCreatingTransaction, transactionJSON, attestationHashBase64]);
  

  return (
    <div className="flex flex-col pt-4 z-50">
      {!attest.zkappHasBeenSetup && (
        <p className="animate-pulse text-red-500 text-center">
          The contract is currently compiling, please wait...
        </p>
      )}
      {attest.zkappHasBeenSetup && (
        <button
          disabled={isCreatingTransaction || isSendingTransaction}
          onClick={transactionJSON === null ? onCreateTransaction : onSendTransaction}
          className={`transition-all ease-in-out font-bold py-2 px-4 rounded ${messageType === 'error' ? 'bg-red-500 hover:bg-red-700 disabled:bg-red-900' :
              'bg-green-500 hover:bg-green-700 disabled:bg-green-900'
            } text-white`}        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export { ProofStep };
