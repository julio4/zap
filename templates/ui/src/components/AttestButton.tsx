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
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statement, setStatement] = useState<Statement>(defaultStatement);

  return (
    <>
      {showStatementModal && (
        <Modal
          isOpen={showStatementModal}
          setIsOpen={setShowStatementModal}
          body={
            <ProveStatement statement={statement} setStatement={setStatement} />
          }
        />
      )}
      <button
        type="button"
        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
