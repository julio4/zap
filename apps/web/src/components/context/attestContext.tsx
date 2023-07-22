import { JsonRpcSigner } from "ethers";
import { createContext, useState } from "react";

type MinaWallet = {
  isConnected: boolean;
  address: string;
};

type EthereumWallet = {
  isConnected: boolean;
  address: string;
  signature: string;
  signer?: JsonRpcSigner;
};

type AttestContextType = {
  zkApp: any;
  minaWallet: MinaWallet;
  setMinaWallet: (minaWallet: MinaWallet) => void;
  ethereumWallet: EthereumWallet;
  setEthereumWallet: (ethereumWallet: EthereumWallet) => void;
};

const defaultAttestContext: AttestContextType = {
  zkApp: null,
  minaWallet: {
    isConnected: false,
    address: "",
  },
  setMinaWallet: () => {},
  ethereumWallet: {
    isConnected: false,
    address: "",
    signature: "",
  },
  setEthereumWallet: () => {},
};

const AttestContext = createContext<AttestContextType>(defaultAttestContext);

const AttestProvider = ({ children }: { children: React.ReactNode }) => {
  const [attest, setAttest] = useState<AttestContextType>({
    ...defaultAttestContext,
    setMinaWallet: (minaWallet: MinaWallet) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        minaWallet,
      }));
    },
    setEthereumWallet: (ethereumWallet: EthereumWallet) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        ethereumWallet,
      }));
    },
  });

  return (
    <AttestContext.Provider value={attest}>{children}</AttestContext.Provider>
  );
};

export { AttestContext, AttestProvider };
