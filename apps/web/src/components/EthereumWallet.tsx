import React, { useState, useContext } from "react";
import { ethers } from "ethers";
import { AttestContext } from "./context/attestContext";
import { shortenAddress, normalizeAddress } from "../utils/address";

const EthereumWallet = () => {
  const attest = useContext(AttestContext);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, address } = attest.ethereumWallet;

  const handleConnect = async () => {
    try {
      await (window as any).ethereum.send("eth_requestAccounts");
      const provider = new ethers.BrowserProvider(
        (window as any).ethereum,
        "any"
      );
      const network = await provider.getNetwork();

      if (network.chainId !== 1n && network.chainId !== 137n) {
        setError(
          "Wrong network. Please switch to Ethereum Mainnet or Polygon and try again."
        );
        return;
      }
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const normalizedAddress = normalizeAddress(address);

      const signature = await signer.signMessage(`I am ${normalizedAddress}`);

      attest.setEthereumWallet({
        isConnected: true,
        address: normalizedAddress,
        signature,
        signer,
      });
      console.log(`Set connected eth account: ${normalizedAddress}`);
    } catch (err: any) {
      // If the user has a wallet installed but has not created an account, an
      // exception will be thrown. Consider showing "not connected" in your UI.
      console.log(err.message);
      setError(
        err.message || "Error connecting to Ethereum wallet. Please try again."
      );
    }
  };

  const handleDisconnect = () => {
    attest.setEthereumWallet({
      isConnected: false,
      address: "",
      signature: "",
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
      EthereumWallet Component:
      {isConnected ? (
        <div>
          <div>Connected to Ethereum Wallet</div>
          <div>Address: {shortenAddress(address)}</div>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      ) : (
        <div>
          <div>Not connected to Ethereum Wallet</div>
          <button onClick={handleConnect}>Connect</button>
        </div>
      )}
    </div>
  );
};

export { EthereumWallet };
