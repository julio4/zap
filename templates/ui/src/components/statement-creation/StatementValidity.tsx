import { Statement } from "@zap/types";
import React, { useMemo } from "react";
import StatementSelection from "./StatementSelection";
import { Attestation } from "@zap/core";

interface StatementValidityProps {
  statement: Statement;
  attestation: Attestation;
  isAttestValid: boolean;
}

const StatementValidity = (props: StatementValidityProps) => {
  const attestStyle = useMemo(
    () =>
      props.attestation && props.isAttestValid
        ? "border-green-500 text-green-500"
        : "border-red-500 text-red-500",
    [props.attestation, props.isAttestValid]
  );

  return (
    <>
      <h2 className={`text-xl text-center mb-2 mt-0 ${attestStyle}`}>
        {props.isAttestValid ? "Valid statement" : "Invalid statement"}
      </h2>
      <div
        className={`border-2 rounded-md py-2 ${attestStyle} w-fit self-center p-4`}
      >
        {/* pass empty function to setStatement as the statement selection is disabled anyway */}
        <StatementSelection
          statement={props.statement}
          disable
          setStatement={() => {}}
          privateData={props.attestation?.privateData.toString()}
        />
      </div>
      <div className="flex flex-col self-center">
        <span className="text-sm text-slate-400">
          The actual private data {props.attestation?.privateData.toString()}{" "}
          makes the statement {props.isAttestValid ? "true" : "untrue"}.{" "}
        </span>

        {!props.isAttestValid && (
          <span className="text-sm text-slate-400">
            If you think this is incorrect, please double check the source
            public key or contact the source operator.{" "}
          </span>
        )}

        <span className="text-sm text-slate-400">
          {" "}
          Even though you private data is displayed here, it will not be
          disclosed on-chain.{" "}
        </span>
      </div>
    </>
  );
};

export default StatementValidity;
