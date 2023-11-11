"use client";
import { useContext } from "react";
import { AttestContext } from "../context/attestContext";
import { Condition } from "../../types";

let transactionFee = 0.1;

const ProofStep = () => {
  const attest = useContext(AttestContext);

  let ArgsToGenerateAttestation: {
    senderKey58: string;
    conditionType: Condition;
    targetValue: number;
    value: number;
    hashRoute: string;
    signature: string;
  }

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

    if (attest.privateData === null) {
      throw new Error("privateData is not defined");
    }

    ArgsToGenerateAttestation = {
      senderKey58: attest.minaWallet.address,
      conditionType: attest.statement!.condition.type,
      targetValue: attest.statement!.condition.targetValue,
      value: attest.privateData.data.value,
      hashRoute: attest.privateData.data.hashRoute,
      signature: attest.privateData.signature,
    };

    
    console.log("ArgsToGenerateAttestation", ArgsToGenerateAttestation);
    console.log("fetch oracle public key");
    const oraclePubKey = await attest.zkappWorkerClient!.getOraclePublicKey();
    console.log("oraclePubKey is:", oraclePubKey);
    
    // console.log("setting oracle public key");
    // const newOraclePubKey = "B62qmN3EthPdRmnit65JWNSbdYdXSt9vt766rt2em2eLoAewf8o72V2"
    // const argsSetPublicKey = {
    //   senderKey58: attest.minaWallet.address,
    //   newOraclePublicKey58: newOraclePubKey,
    // };
    // await attest.zkappWorkerClient!.setOraclePublicKey(argsSetPublicKey);

    console.log("just before createGenerateAttestationTransaction");
    await attest.zkappWorkerClient!.createGenerateAttestationTransaction(ArgsToGenerateAttestation);
    console.log("just after createGenerateAttestationTransaction");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("seems to be done???");
    
    attest.setDisplayText('Creating the proof...');
    console.log("Creating the proof...");
    await attest.zkappWorkerClient!.proveGenerateAttestationTransaction();
    await new Promise((resolve) => setTimeout(resolve, 1000));

    attest.setDisplayText('Requesting send transaction...');
    console.log("Requesting send transaction...");
    const transactionJSON = await attest.zkappWorkerClient!.getTransactionJSON();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    attest.setDisplayText('Getting transaction JSON...');
    console.log('Getting transaction JSON...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attest.setFinalResult(hash);
  };

  return (
    <div className="flex flex-col pt-4">
      <button
        disabled={!attest.zkappHasBeenSetup}
        onClick={onSendTransaction}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        {attest.zkappHasBeenSetup ? "Send transaction" : "Compiling contract... Please wait"}
      </button>
    </div>
  );
};

export { ProofStep };
