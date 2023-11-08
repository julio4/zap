import React, { useState, useContext } from "react";
import { AttestContext } from "./context/attestContext";
import { shortenAddress } from "../utils/address";
import { PublicKey } from "o1js";

const MinaWallet = () => {
  const attest = useContext(AttestContext);
  const { isConnected, address } = attest.minaWallet;
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    try {
      console.log("Connecting to Mina wallet...")
      const network = await (window as any).mina.requestNetwork();
      if (network !== "Berkeley") {
        setError(
          "Not connected to Berkeley Testnet. Please switch to Berkeley Testnet and try again."
        );
        console.log("Mina wallet is not connected to Berkeley Testnet. Please switch to Berkeley Testnet and try again.")
        return;
      }
      // Accounts is an array of string Mina addresses.
      const publicKeyBase58 = (await (window as any).mina.requestAccounts())[0];
      const publicKey = PublicKey.fromBase58(publicKeyBase58);

      console.log(`Using key:${publicKey.toBase58()}`);
      console.log('Checking if fee payer account exists...');

      const res = await attest.zkappWorkerClient?.fetchAccount({
        publicKey: publicKey!,
      });
      console.log(res);

      attest.setMinaWallet({
        isConnected: true,
        address: publicKeyBase58,
      });
    } catch (err: any) {
      // If the user has a wallet installed but has not created an account, an
      // exception will be thrown. Consider showing "not connected" in your UI.
      console.log(err.message);
      console.log("Either Mina wallet not installed, no account created or connection refused.")
      setError("Connection Error. See console for details.");
    }
  };

  /*   const handleDisconnect = () => {
      attest.setMinaWallet({
        isConnected: false,
        address: "",
      });
    }; */

  if (error) return (
    <span
      className="h-5 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-red-900 text-red-300">
      {error || "Error connecting to Mina wallet. See logs for details."}
    </span>
  )

  return (
    <>
      {isConnected ? (
        <span
          className="h-5 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-green-900 text-green-300">
          Mina: {shortenAddress(address)}
        </span>
      ) : (
        <span
          onClick={handleConnect}
          className="cursor-pointer h-5 hover:scale-[1.05] duration-100 ease-in transition-all text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-red-900 text-red-300">
          Mina: Connect
        </span>
      )}
    </>
  );
};

export { MinaWallet };
