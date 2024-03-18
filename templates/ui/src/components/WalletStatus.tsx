import React from "react";

type WalletStatusProps = {
  hasWallet: boolean | null;
  publicKey: string;
};

const WalletStatus = ({ hasWallet, publicKey }: WalletStatusProps) => {
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
