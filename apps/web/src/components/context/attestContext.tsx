import { createContext, useState } from "react";
import { MinaWallet, EthereumWallet, Statement, SignResponse, PrivateData } from "../../types";
import ZkappWorkerClient from "../../pages/zkappWorkerClient"
import { Field } from "o1js";

type AttestContextType = {
  zkappWorkerClient: ZkappWorkerClient | null;
  setZkappWorkerClient: (zkappWorkerClient: ZkappWorkerClient) => void;
  zkappHasBeenSetup: boolean;
  minaWallet: MinaWallet;
  setMinaWallet: (minaWallet: MinaWallet) => void;
  ethereumWallet: EthereumWallet;
  setEthereumWallet: (ethereumWallet: EthereumWallet) => void;
  statement: Statement | null;
  setStatement: (statement: Statement) => void;
  privateData: PrivateData | null;
  setPrivateData: (privateData: PrivateData) => void;
  privateDataInput: Field[];
  setPrivateDataInput: (privateDataInput: Field[]) => void;
  creatingTransaction: boolean;
  displayText: string;
  setDisplayText: (displayText: string) => void;
  set: (attest: AttestContextType) => void;
  finalResult: string;
  setFinalResult: (finalResult: string) => void;
};

const defaultAttestContext: AttestContextType = {
  zkappWorkerClient: null,
  setZkappWorkerClient: () => {},
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
  privateDataInput: [],
  setPrivateDataInput: () => {},
  creatingTransaction: false,
  displayText: "",
  setDisplayText: () => {},
  set: () => {},
  finalResult: "",
  setFinalResult: () => {},
};

const AttestContext = createContext<AttestContextType>(defaultAttestContext);

const AttestProvider = ({ children }: { children: React.ReactNode }) => {
  const [attest, setAttest] = useState<AttestContextType>({
    ...defaultAttestContext,
    setZkappWorkerClient: (zkappWorkerClient: ZkappWorkerClient) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        zkappWorkerClient,
        zkappHasBeenSetup: true,
      }));
    },
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
    setPrivateData: (privateData: PrivateData) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        privateData,
      }));
    },
    setPrivateDataInput: (privateDataInput: Field[]) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        privateDataInput,
      }));
    },
    set: (attest: AttestContextType) => {
      setAttest(attest);
    },
    setFinalResult: (finalResult: string) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        finalResult,
      }));
    }
  });

  return (
    <AttestContext.Provider value={attest}>{children}</AttestContext.Provider>
  );
};

export { AttestContext, AttestProvider };
