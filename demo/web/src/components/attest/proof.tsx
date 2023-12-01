"use client";
import { useContext, useState } from "react";
import { AttestContext } from "../context/attestContext";
import { Condition } from "../../types";
import { createAttestationNoteEncoded } from "../../utils/createBase64Attestation";
import { Field, Poseidon, PublicKey } from "o1js";

let transactionFee = 0.1;

const ProofStep = () => {
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
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
    if (isSendingTransaction) {
      return;
    }
    setIsSendingTransaction(true);

    const { zkappWorkerClient } = attest;
    if (!zkappWorkerClient) {
      throw new Error("zkappWorkerClient is not defined");
    }

    const { minaWallet } = attest;
    if (!minaWallet) {
      throw new Error("minaWallet is not defined");
    }

    attest.setDisplayText('Creating a transaction...');
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

    await attest.zkappWorkerClient!.createGenerateAttestationTransaction(ArgsToGenerateAttestation);

    attest.setDisplayText('Creating the proof...');
    await attest.zkappWorkerClient!.proveGenerateAttestationTransaction();

    attest.setDisplayText('Requesting send transaction...');
    const transactionJSON = await attest.zkappWorkerClient!.getTransactionJSON();

    let conditionTypeNumber: number;
    switch (attest.statement!.condition.type) {
      case Condition.LESS_THAN:
        conditionTypeNumber = 1;
        break;
      case Condition.GREATER_THAN:
        conditionTypeNumber = 2;
        break;
      case Condition.EQUAL:
        conditionTypeNumber = 3;
        break;
      case Condition.DIFFERENT:
        conditionTypeNumber = 4;
        break;
      default:
        throw new Error("conditionType not supported");
    }

    const hashAttestation = Poseidon.hash([
      Field.from(attest.privateData.data.hashRoute),
      Field.from(conditionTypeNumber),
      Field.from(attest.statement!.condition.targetValue),
      PublicKey.fromBase58(attest.minaWallet.address).toFields()[0],
    ]).toString();


    const attestationHashBase64 = createAttestationNoteEncoded(
      attest.statement!.condition.type,
      attest.statement!.condition.targetValue,
      attest.privateData.data.value,
      attest.statement!.request,
      attest.privateData.data.hashRoute,
      hashAttestation
    );

    attest.setDisplayText('Getting transaction JSON...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: '',
      },
    });

    attest.setDisplayText('Transaction sent with hash: ' + hash);
    attest.setFinalResult(attestationHashBase64);

    setIsSendingTransaction(false);
  };

  return (
    <div className="flex flex-col pt-4 z-50">
      {!attest.zkappHasBeenSetup && (
        <p className="animate-pulse text-red-500 text-center">
          The contract is currently compiling, please wait...
        </p>
      )}
      {attest.zkappHasBeenSetup && (
        <button
          disabled={isSendingTransaction}
          onClick={onSendTransaction}
          className="transition-all ease-in-out bg-green-500 hover:bg-green-700 disabled:bg-green-900 text-white font-bold py-2 px-4 rounded"
        >
          {attest.displayText || "Generate proof"}
        </button>
      )}
    </div>
  );
};

export { ProofStep };
