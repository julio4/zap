"use client";
import { useEffect, useContext } from "react";
import { AttestContext } from "../context/attestContext";
import { SelectStep } from "./select";
import { ProofStep } from "./proof";

import ZkappWorkerClient from "../../pages/zkappWorkerClient";
import { PublicKey } from "o1js";
import { MinaWallet } from "../MinaWallet";
import { EthereumWallet } from "../EthereumWallet";

async function timeout(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

const Attest = () => {
  const attest = useContext(AttestContext);

  useEffect(() => {
    (async () => {
      if (!attest.zkappHasBeenSetup) {
        console.log("Loading web worker...");
        const zkappWorkerClient = new ZkappWorkerClient();
        await timeout(5);

        console.log("Done loading web worker");

        await zkappWorkerClient.setActiveInstanceToBerkeley();
        await zkappWorkerClient.loadContract();

        console.log("Compiling zkApp...");
        await zkappWorkerClient.compileContract();
        console.log("zkApp compiled");

        const zkappAddress = process.env["ZK_APP"];
        console.log("zkAppAddress", zkappAddress);
        const zkappPublicKey = PublicKey.fromBase58(zkappAddress!);
        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log('Getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        // const currentNum = await zkappWorkerClient.getNum();
        // console.log(`Current number in zkApp state: ${currentNum.toString()}`);

        console.log("Setting up finished");
        attest.setZkappWorkerClient(zkappWorkerClient);
      }
    })();
  }, []);

  // 1: Connect wallets
  const step1 = !(
    attest.minaWallet.isConnected && attest.ethereumWallet.isConnected
  );
  // 2: Select statement, condition and sign -> get signed values from oracle
  const step2 = !step1 && !(attest.statement && attest.privateData);
  // 3: Generate proof and send tx on Mina ZAP contract
  const step3 = !step1 && !step2 && !attest.finalResult;
  // 4: Generate attestation note/confirmation
  const step4 = attest.finalResult;

  return (
    <div className="flex items-center flex-col gap-5">
      {step1 && !step2 && (
        <div className="flex flex-col py-4">
          <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
            Connect your wallets
          </h2>
          <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
            Please connect your wallets! Your ethereum wallet will be the source
            of data for the attestation. Your mina wallet will be used to submit
            and save the attestation on the ZAP protocol on Mina. There will be
            no association between your ethereum and mina wallets.
          </p>
          <div className="flex flex-row justify-center gap-5 mt-5">
            <MinaWallet />
            <EthereumWallet />
          </div>
        </div>
      )}
      {step2 && !step3 && (
        <div className="flex flex-col py-4">
          <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
            Choose your statement 
          </h2>
          <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
            The statement define the condition that will be attested on a specific data source.
          </p>
          <SelectStep />
        </div>
      )}
      {step3 && (
        <div className="flex flex-col py-4">
          <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
            Generate and submit proof
          </h2>
          <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
            Generate a Zero-Knowledge proof of the statement and submit it to the ZAP protocol on Mina.
          </p>
          <ProofStep />
        </div>
      )}
      {step4 && (
        <div className="flex flex-col py-4">
          <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
            Attestation note!
          </h2>
          <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
            Your attestation note is ready! You can now share it with your recipient.
            Be aware that it is impossible to recover it if you lose it, so make sure to keep it safe. :D
          </p>
          <pre className="whitespace-pre-wrap font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
            {attest.finalResult}
          </pre>
        </div>
      )}
    </div>
  );
}

export {
  Attest
}