import Head from "next/head";
import { useEffect } from "react";
import GradientBG from "../components/GradientBG.js";
import styles from "../styles/Home.module.css";

import { Route, ZapRequestParams } from "@zap/types";

const loadZap = async () => {
  const { Mina, PublicKey } = await import("o1js");
  const { Zap } = await import("@zap/core");

  const zkAppAddress =
    "B62qnhBxxQr7h2AE9f912AyvzJwK1fhEJq7NMZXbzXbhoepUZ7z7237";
  // TODO remove
  if (!zkAppAddress) {
    console.error(
      'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
    );
  }
  const zkApp = new Zap(PublicKey.fromBase58(zkAppAddress));
  console.log("zkApp", zkApp);
};

export default function Home(): JSX.Element {
  useEffect(() => {
    loadZap();
  }, []);

  return (
    <>
      <Head>
        <title>Zap zkApp UI</title>
        <meta name="description" content="built with o1js" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <GradientBG>
        <main className={styles.main}>
          <p className={styles.start}>
            Minimal Next.js Mina Zap template
          </p>
        </main>
      </GradientBG>
    </>
  );
}
