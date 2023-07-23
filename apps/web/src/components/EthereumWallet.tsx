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

  if (error) return;

  return (
    <>
      {isConnected ? (
        <span
          className="h-5 bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
          Ethereum: {shortenAddress(address)}
        </span>
      ) : (
        <span
          onClick={handleConnect}
          className="cursor-pointer h-5 hover:scale-[1.05] duration-100 ease-in transition-all bg-red-100 text-red-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">
            Ethereum: Connect
        </span>
      )}
    </>
  );
};

export { EthereumWallet };
