import React from "react";
import useZapStore from '../store/zapStore';

const AccountStatus = () => {
    const { zapState } = useZapStore(state => state);

    if (!zapState.accountExists) {
        const faucetLink = `https://faucet.minaprotocol.com/?address=${zapState.publicKey?.toBase58()}`;
        return (
            <div>
                Account does not exist. <a href={faucetLink} target="_blank" rel="noreferrer">Visit the faucet to fund this fee payer account</a>
            </div>
        );
    }

    return null;
};

export default AccountStatus;