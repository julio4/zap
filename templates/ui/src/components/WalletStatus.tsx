import React, { useEffect } from "react";
import useZapStore from '../store/zapStore';

type WalletStatusProps = {
  hasWallet: boolean | null;
  publicKey: string;
};

const WalletStatus = () => {
  const { hasWallet, publicKey, setZapState } = useZapStore(state => ({
    hasWallet: state.zapState.hasWallet,
    publicKey: state.zapState.publicKey?.toBase58() || "",
    setZapState: state.setZapState,
  }));

  useEffect(() => {
    const mina = (window as any).mina;
    if (mina == null) {
      setZapState({ hasWallet: false });
    }
  }, [setZapState]);

  if (hasWallet === false) {
    return (
      <div>Could not find a wallet. <a href="https://www.aurowallet.com/" target="_blank" rel="noreferrer">Install Auro wallet here</a></div>
    );
  }
  
  if (!hasWallet) {
    console.log("Wallet not found");
    return null;
  }

  return (
    <div>
      Account public key: {publicKey}
    </div>
  );
};

export default WalletStatus;
