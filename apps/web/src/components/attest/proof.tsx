"use client";
import { useEffect, useContext, useState } from "react";
import { AttestContext } from "../context/attestContext";

let transactionFee = 0.1;

const ProofStep = () => {
  const attest = useContext(AttestContext);

  let ArgsToGenerateAttestation = {
    conditionType: attest.statement!.condition.type,
    targetValue: attest.statement!.condition.targetValue,
    hashRoute: attest.statement!.request, // Todo! s'assurer que c'est bien ça
    privateData: attest.privateData.data,
    signature: attest.privateData.signature,
  };

  const onSendTransaction = async () => {
    const { zkappWorkerClient } = attest;
    if (!zkappWorkerClient) {
      throw new Error("zkappWorkerClient is not defined");
    }

    const { minaWallet } = attest;
    if (!minaWallet) {
      throw new Error("minaWallet is not defined");
    }

    attest.setDisplayText('Creating a transaction...');
    console.log("Creating a transaction...");
    attest.set({ ...attest, creatingTransaction: true });

    await attest.zkappWorkerClient!.createGenerateAttestationTransaction(ArgsToGenerateAttestation);


    attest.setDisplayText('Creating the proof...');
    console.log("Creating the proof...");
    await attest.zkappWorkerClient!.proveGenerateAttestationTransaction();

    attest.setDisplayText('Requesting send transaction...');
    console.log("Requesting send transaction...");
    const transactionJSON = await attest.zkappWorkerClient!.getTransactionJSON();

    attest.setDisplayText('Getting transaction JSON...');
    console.log('Getting transaction JSON...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });
  };

  return (
    <div className="flex flex-col pt-4">
      <button
        onClick={onSendTransaction}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Send transaction
      </button>
    </div>
  );
};

export { ProofStep };
