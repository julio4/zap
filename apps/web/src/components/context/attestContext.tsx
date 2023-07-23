import { createContext, useState } from "react";
import { MinaWallet, EthereumWallet, Statement } from "../../types";
import ZkappWorkerClient from "../../pages/zkappWorkerClient";

type AttestContextType = {
  zkappWorkerClient: ZkappWorkerClient | null;
  zkappHasBeenSetup: boolean;
  minaWallet: MinaWallet;
  setMinaWallet: (minaWallet: MinaWallet) => void;
  ethereumWallet: EthereumWallet;
  setEthereumWallet: (ethereumWallet: EthereumWallet) => void;
  statement: Statement | null;
  setStatement: (statement: Statement) => void;
  privateData: any;
  setPrivateData: (privateData: any) => void;
  set: (attest: AttestContextType) => void;
  creatingTransaction: boolean;
  displayText: string;
  setDisplayText: (displayText: string) => void;
};

const defaultAttestContext: AttestContextType = {
  zkappWorkerClient: null,
  zkappHasBeenSetup: false,
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
  privateData: null,
  setPrivateData: () => {},
  set: () => {},
  creatingTransaction: false,
  displayText: "",
  setDisplayText: () => {},
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
    setPrivateData: (privateData: any) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        privateData,
      }));
    },
    set: (attest: AttestContextType) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        ...attest,
      }));
    },
  });

  return (
    <AttestContext.Provider value={attest}>{children}</AttestContext.Provider>
  );
};

export { AttestContext, AttestProvider };
