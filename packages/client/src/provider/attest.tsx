import React, { createContext, useState } from "react";
import {
  MinaWallet,
  // EthereumWallet,
  ClientStatement,
  PrivateData,
} from "@zap/types";
import { ZapWorkerClient } from "../zapWorkerClient.js";

import { Field } from "o1js";

export type AttestContextType = {
  workerClient: ZapWorkerClient | null;
  setWorkerClient: (workerClient: ZapWorkerClient) => void;
  zapHasBeenSetup: boolean;
  minaWallet: MinaWallet;
  setMinaWallet: (minaWallet: MinaWallet) => void;
  // to put into a sourceProvider :
  // ethereumWallet: EthereumWallet;
  // setEthereumWallet: (ethereumWallet: EthereumWallet) => void;
  statement: ClientStatement | null;
  setStatement: (statement: ClientStatement) => void;
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
  workerClient: null,
  setWorkerClient: () => {},
  zapHasBeenSetup: false,
  minaWallet: {
    isConnected: false,
    address: "",
  },
  setMinaWallet: () => {},
  // ethereumWallet: {
  //   isConnected: false,
  //   address: "",
  //   signature: "",
  // },
  // setEthereumWallet: () => {},
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
    setWorkerClient: (workerClient: ZapWorkerClient) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        workerClient,
        zapHasBeenSetup: true,
      }));
    },
    setMinaWallet: (minaWallet: MinaWallet) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        minaWallet,
      }));
    },
    // setEthereumWallet: (ethereumWallet: EthereumWallet) => {
    //   setAttest((prevAttest) => ({
    //     ...prevAttest,
    //     ethereumWallet,
    //   }));
    // },
    setStatement: (statement: ClientStatement) => {
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
    },
    setDisplayText: (displayText: string) => {
      setAttest((prevAttest) => ({
        ...prevAttest,
        displayText,
      }));
    },
  });

  return (
    <AttestContext.Provider value={attest}>{children}</AttestContext.Provider>
  );
};

export { AttestContext, AttestProvider };
