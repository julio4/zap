"use client";
import { useEffect, useContext } from "react";
import {
  AttestContext,
  AttestProvider,
} from "../../components/context/attestContext";
import { MinaWallet } from "../../components/MinaWallet";
import { EthereumWallet } from "../../components/EthereumWallet";

export default function Attest() {
  const attest = useContext(AttestContext);

  // Import contract
  useEffect(() => {
    (async () => {
      console.log("Loading snarkyjs and zkApp");
      const { Mina, PublicKey } = await import("snarkyjs");
      const { Add } = await import("@contracts/zap/build/src/");

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      const zkAppAddress = process.env["ZK_APP"];
      // This should be removed once the zkAppAddress is updated.
      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
        );
      }
      //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
      console.log("zkAppAddress", zkAppAddress);
    })();
  }, []);

  return (
    <AttestProvider>
      <MinaWallet />
      <EthereumWallet />
      <p>TODO</p>
    </AttestProvider>
  );
}
