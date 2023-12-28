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
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(
        window.ethereum,
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
    } catch (err) {
      if (err instanceof Error) {
        console.log(err.message);
        setError("Error connecting to Ethereum wallet. See logs for details.");
      } else {
        console.log('An unexpected error occurred');
        setError("An unknown error occurred.");
      }
    }
  };

  /*   const handleDisconnect = () => {
      attest.setEthereumWallet({
        isConnected: false,
        address: "",
        signature: "",
      });
    }; */

  if (error) return (
    <span
      className="h-5 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-red-900 text-red-300">
      {error}
    </span>
  )

  return (
    <>
      {isConnected ? (
        <span
          className="h-5 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-green-900 text-green-300">
          Ethereum: {shortenAddress(address)}
        </span>
      ) : (
        <span
          onClick={handleConnect}
          className="cursor-pointer h-5 hover:scale-[1.05] duration-100 ease-in transition-all text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full bg-red-900 text-red-300">
          Ethereum: Connect
        </span>
      )}
    </>
  );
};

export { EthereumWallet };
