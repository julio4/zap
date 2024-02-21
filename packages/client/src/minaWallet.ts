import { AttestContext } from "./provider/attest.js";
import { useContext } from "react";

// Needed to declare mina object in window
declare global {
  interface Window {
    mina: any;
  }
}

export const connectToMinaWallet = async () => {
  const attest = useContext(AttestContext);
  try {
    const network = await window.mina.requestNetwork();

    if (network.name !== "Berkeley") {
      throw new Error(
        "Mina wallet is not connected to Berkeley Testnet. Please switch to Berkeley Testnet and try again."
      );
    }
    // Accounts is an array of string Mina addresses.
    const publicKeyBase58 = (await window.mina.requestAccounts())[0];

    // const publicKey = PublicKey.fromBase58(publicKeyBase58);
    // console.log(`Using key:${publicKey.toBase58()}`);
    // const res = await attest.zkappWorkerClient?.fetchAccount({
    //   publicKey: publicKey!,
    // });

    attest.setMinaWallet({
      isConnected: true,
      address: publicKeyBase58,
    });
  } catch (err) {
    throw new Error(
      "Error connecting to Mina wallet. See following details: " + err
    );
  }
};
