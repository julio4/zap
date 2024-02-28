import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { AttestContext } from "../provider/attest.js";
import { useContext } from "react";
import { WrongNetworkError } from "../errors/mina-wallet/wrongNetwork.js";
import { ConnectionError } from "../errors/mina-wallet/connection.js";

// Needed to declare mina object in window
declare global {
  interface Window {
    mina: any;
  }
}

/**
 * Custom hook that connects to Mina wallet.
 * @throws MinaWalletError
 */
export const useConnectToMinaWallet = (): UseMutationResult<
  void,
  Error,
  void,
  unknown
> => {
  // TODO ? omitting data related fields as connectToMinaWallet returns void ?
  // const { data, ...rest }:
  // return { ...rest };
  return useMutation({
    mutationFn: connectToMinaWallet,
  });
};

// isn't it supposed to be a custom hook as it calls useContext() ??
const connectToMinaWallet = async (): Promise<void> => {
  const attest = useContext(AttestContext);
  try {
    const network = await window.mina.requestNetwork();

    if (network.name !== "Berkeley") {
      throw new WrongNetworkError();
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
    throw new ConnectionError(err);
  }
};
