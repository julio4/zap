import React from "react";

type AccountStatusProps = {
  accountExists: boolean;
  publicKey: string;
};

const AccountStatus = ({ accountExists, publicKey }: AccountStatusProps) => {
  if (!accountExists) {
    const faucetLink = `https://faucet.minaprotocol.com/?address=${publicKey}`;
    return (
      <div>
        Account does not exist. <a href={faucetLink} target="_blank" rel="noreferrer">Visit the faucet to fund this fee payer account</a>
      </div>
    );
  }

  return null;
};

export default AccountStatus;
