import { createContext, useState } from "react";
import { MinaWallet, EthereumWallet, Statement } from "../../types";

type AttestContextType = {
  zkApp: any;
  minaWallet: MinaWallet;
  setMinaWallet: (minaWallet: MinaWallet) => void;
  ethereumWallet: EthereumWallet;
  setEthereumWallet: (ethereumWallet: EthereumWallet) => void;
  statement: Statement | null;
  setStatement: (statement: Statement) => void;
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
  statement: null,
  setStatement: () => {},
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
    setStatement: (statement: Statement) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        statement,
      }));
    },
  });

  return (
    <AttestContext.Provider value={attest}>{children}</AttestContext.Provider>
  );
};

export { AttestContext, AttestProvider };
