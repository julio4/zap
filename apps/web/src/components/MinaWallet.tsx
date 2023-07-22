import React, { useState, useContext } from "react";
import { AttestContext } from "./context/attestContext";
import { shortenAddress } from "../utils/address";

const MinaWallet = () => {
  const attest = useContext(AttestContext);
  const { isConnected, address } = attest.minaWallet;
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    let accounts;

    try {
      const network = await (window as any).mina.requestNetwork();
      if (network !== "Berkeley") {
        setError(
          "Mina wallet is not connected to Berkeley Testnet. Please switch to Berkeley Testnet and try again."
        );
        return;
      }

      // Accounts is an array of string Mina addresses.
      accounts = await (window as any).mina.requestAccounts();

      console.log(`Set connected account: ${accounts[0]}`);

      attest.setMinaWallet({
        isConnected: true,
        address: accounts[0],
      });
    } catch (err: any) {
      // If the user has a wallet installed but has not created an account, an
      // exception will be thrown. Consider showing "not connected" in your UI.
      console.log(err.message);
      setError("Mina wallet not found. Try to install Auro and try again.");
    }
  };

  const handleDisconnect = () => {
    attest.setMinaWallet({
      isConnected: false,
      address: "",
    });
  };

  if (error)
    return (
      <div className="border-2 border-red-500 p-4 rounded-xl bg-red-100">
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Close</button>
      </div>
    );

  return (
    <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
      MinaWallet Component:
      {isConnected ? (
        <div>
          <div>Connected to Mina Wallet</div>
          <div>Address: {shortenAddress(address)}</div>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <div>
          <div>Not connected to Mina Wallet</div>
          <button onClick={handleConnect}>Connect</button>
        </div>
      )}
    </div>
  );
};

export { MinaWallet };