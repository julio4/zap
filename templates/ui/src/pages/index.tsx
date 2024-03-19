import Head from "next/head";
import { PublicKey } from "o1js";
import { useEffect, useState } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";
import HeadComponent from "../components/Header";
import WalletStatus from "../components/WalletStatus";
import AccountStatus from "../components/AccountStatus";

import { ZapWorkerClient } from "@zap/client";

let transactionFee = 0.1;
const ZAP_ADDRESS = "B62qpAdGKr4UyC9eGi3astRV38oC95VAxn2PaS9r4Gj7oobNhqdSn8u";

type ZapState = {
  zapWorkerClient: null | ZapWorkerClient;
  hasWallet: null | boolean;
  hasBeenSetup: boolean;
  accountExists: boolean;
  // currentNum: null | Field,
  publicKey: null | PublicKey;
  zapPublicKey: null | PublicKey;
  creatingTransaction: boolean;
};

export default function Home(): JSX.Element {
  const [zapState, setZapState] = useState<ZapState>({
    zapWorkerClient: null,
    hasWallet: null,
    hasBeenSetup: false,
    accountExists: false,
    // currentNum: null,
    publicKey: null,
    zapPublicKey: null,
    creatingTransaction: false,
  });
  const [displayText, setDisplayText] = useState("");
  const [transactionlink, setTransactionLink] = useState("");

  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!zapState.hasBeenSetup) {
        setDisplayText("Loading web worker...");
        console.log("Loading web worker...");
        const zkappWorkerClient = new ZapWorkerClient();
        await timeout(5);

        setDisplayText("Done loading web worker");
        console.log("Done loading web worker");

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const mina = (window as any).mina;

        if (mina == null) {
          setZapState({ ...zapState, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log(`Using key:${publicKey.toBase58()}`);
        setDisplayText(`Using key:${publicKey.toBase58()}`);

        setDisplayText("Checking if fee payer account exists...");
        console.log("Checking if fee payer account exists...");

        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });
        const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        console.log("Compiling zkApp...");
        setDisplayText("Compiling zkApp...");
        await zkappWorkerClient.compileContract();
        console.log("zkApp compiled");
        setDisplayText("zkApp compiled...");

        const zkappPublicKey = PublicKey.fromBase58(ZAP_ADDRESS);

        await zkappWorkerClient.initZapInstance(zkappPublicKey);

        console.log("Getting zkApp state...");
        setDisplayText("Getting zkApp state...");
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        // const currentNum = await zkappWorkerClient.getNum();
        // console.log(`Current state in zkApp: ${currentNum.toString()}`);
        setDisplayText("");

        setZapState({
          ...zapState,
          zapWorkerClient: zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zapPublicKey: zkappPublicKey,
          accountExists,
          // currentNum
        });
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  useEffect(() => {
    (async () => {
      if (zapState.hasBeenSetup && !zapState.accountExists) {
        for (;;) {
          setDisplayText("Checking if fee payer account exists...");
          console.log("Checking if fee payer account exists...");
          const res = await zapState.zapWorkerClient!.fetchAccount({
            publicKey: zapState.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setZapState({ ...zapState, accountExists: true });
      }
    })();
  }, [zapState.hasBeenSetup]);

  // -------------------------------------------------------
  // Send a transaction

  const onSendTransaction = async () => {
    setZapState({ ...zapState, creatingTransaction: true });

    setDisplayText('Creating a transaction...');
    console.log('Creating a transaction...');

    await zapState.zapWorkerClient!.fetchAccount({
      publicKey: zapState.publicKey!
    });

    // await zapState.zkappWorkerClient!.createUpdateTransaction();

    setDisplayText('Creating proof...');
    console.log('Creating proof...');
    // await zapState.zkappWorkerClient!.proveUpdateTransaction();

    console.log('Requesting send transaction...');
    setDisplayText('Requesting send transaction...');
    // const transactionJSON = await zapState.zkappWorkerClient!.getTransactionJSON();

    setDisplayText('Getting transaction JSON...');
    console.log('Getting transaction JSON...');
    // const { hash } = await (window as any).mina.sendTransaction({
    //   transaction: transactionJSON,
    //   feePayer: {
    //     fee: transactionFee,
    //     memo: ''
    //   }
    // });

    // const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
    // console.log(`View transaction at ${transactionLink}`);

    // setTransactionLink(transactionLink);
    // setDisplayText(transactionLink);

    setZapState({ ...zapState, creatingTransaction: false });
  };

  // -------------------------------------------------------
  // Refresh the current state

  const onRefresh = async () => {
    console.log('Getting zkApp state...');
    setDisplayText('Getting zkApp state...');

    await zapState.zapWorkerClient!.fetchAccount({
      publicKey: zapState.zapPublicKey!
    });
    // const currentNum = await zapState.zkappWorkerClient!.getNum();
    // setZapState({ ...zapState, currentNum });
    // console.log(`Current state in zkApp: ${currentNum.toString()}`);
    setDisplayText('');
  };

  return (
    <>
      <HeadComponent title="Zap zkApp UI" description="built with o1js" />
      <GradientBG>
        <main className={styles.main}>
          <p className={styles.start}>Minimal Next.js Mina Zap template</p>
          <WalletStatus hasWallet={zapState.hasWallet} publicKey={zapState.publicKey?.toBase58() || ""} />
          <AccountStatus accountExists={zapState.accountExists} publicKey={zapState.publicKey?.toBase58() || ""} />
        </main>
      </GradientBG>
    </>
  );
}
