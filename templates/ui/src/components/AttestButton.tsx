import React, { useState } from "react";
import Modal from "./Modal";
import ProveStatement from "./statement-creation/ProveStatement";
import { PrivateKey } from "o1js";
import { ConditionType, Statement } from "@zap/types";

// For testing purposes
const oraclePrivateKey = "EKFcCkoWNfp9mc5cyxXFAQ8NUCdYQvdVQc4ciRcUHDDVZ7nPVofQ";
const sourcePrivateKey = PrivateKey.fromBase58(oraclePrivateKey);
const sourceKey = sourcePrivateKey.toPublicKey();
const defaultStatement: Statement = {
  sourceKey: sourceKey.toBase58(),
  route: {
    path: "/api/example/nb",
    args: {
      id: 7,
    },
  },
  condition: {
    type: ConditionType.GT,
    targetValue: Infinity,
  },
};
// ~~

const AttestButton = () => {
  const [showStatementModal, setShowStatementModal] = useState(true);
  const [statement, setStatement] = useState<Statement>(defaultStatement);

  return (
    <>
      {showStatementModal && (
        <Modal
          close={() => setShowStatementModal(false)}
          body={
            <ProveStatement statement={statement} setStatement={setStatement} />
          }
        />
      )}
      <button
        type="button"
        className="md:w-[30%] sm:w-fit ml-auto mt-auto bg-slate-700 hover:bg-slate-800 text-white py-2 rounded"
        onClick={() => {
          setShowStatementModal(true);
        }}
      >
        Attest statement
      </button>
    </>
  );
};

export default AttestButton;
