"use client";
import { useEffect, useContext, useState } from "react";
import { AttestContext } from "../context/attestContext";
import { SelectStep } from "./select";
import { ProofStep } from "./proof";

import ZkappWorkerClient from "../../pages/zkappWorkerClient";
import { PublicKey } from "snarkyjs";
import { MinaWallet } from "../../components/MinaWallet";
import { EthereumWallet } from "../../components/EthereumWallet";

async function timeout(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

const Attest = () => {
  const attest = useContext(AttestContext);
  const [debug, setDebug] = useState<boolean>(false);

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

        // console.log('Getting zkApp state...');
        // await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        // const currentNum = await zkappWorkerClient.getNum();
        // console.log(`Current number in zkApp state: ${currentNum.toString()}`);

        console.log("Setting up finished");
        attest.setZkappWorkerClient(zkappWorkerClient);
      }
    })();
  }, []);

  // Import contract
  // useEffect(() => {
  //   (async () => {
  //     console.log("Loading snarkyjs and zkApp");
  //     const { Mina, PublicKey } = await import("snarkyjs");
  //     const { Zap } = await import("@contracts/zap/build/src/Zap");

  //     // Update this to use the address (public key) for your zkApp account.
  //     // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
  //     // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
  //     const zkAppAddress = process.env["ZK_APP"];
  //     // This should be removed once the zkAppAddress is updated.
  //     if (!zkAppAddress) {
  //       console.error(
  //         'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
  //       );
  //     }
  //     //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
  //     console.log("zkAppAddress", zkAppAddress);
  //   })();
  // }, []);

  // 1: Connect wallets
  const step1 = !(
    attest.minaWallet.isConnected && attest.ethereumWallet.isConnected
  );
  // 2: Select statement, condition and sign -> get signed values from oracle
  const step2 = !step1 && !(attest.statement && attest.privateData);
  // 3: Generate proof and send tx on Mina ZAP contract
  const step3 = !step1 && !step2;
  // 4: Generate attestation note/confirmation

  return (
    <div className="flex items-center flex-col gap-5">
      {step1 && !step2 && (
        <div className="flex flex-col py-4">
          <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
            Choose your attestation 
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
        <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP2
          <SelectStep />
        </div>
      )}
      {step3 && (
        <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP3
          <p>Generating proof and send tx on Mina ZAP contract!</p>
          <ProofStep />
        </div>
      )}
      {/* <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP4
          <p>
            Get the attestation note (don't lose it!).
          </p>
      </div> */}
    </div>
  );
}

export {
  Attest
}