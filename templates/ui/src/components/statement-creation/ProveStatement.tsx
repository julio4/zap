import React, { useCallback, useEffect, useState } from "react";
import { Field, PrivateKey, Signature } from "o1js";
import { Statement, ZapSignedResponse } from "@zap/types";
import { Attestation, ProvableStatement } from "@zap/core";
import StatementDefinition from "./StatementDefinition";
import FetchSourceDataButton, {
  useFetchDataFromSource,
} from "./FetchSourceDataButton";
import StatementValidity from "./StatementValidity";
import GenerateProofButton from "./GenerateProofButton";

interface ProveStatementProps {
  statement: Statement;
  setStatement: React.Dispatch<React.SetStateAction<Statement>>;
}

const ProveStatement = (props: ProveStatementProps) => {
  const [attestation, setAttestation] = useState<Attestation>();
  const [isAttestValid, setIsAttestValid] = useState(false);

  const { mutateAsync: fetchSourceData, isPending } = useFetchDataFromSource();

  const onFetchSourceData = useCallback(
    (res: ZapSignedResponse) => {
      const attest = new Attestation({
        statement: ProvableStatement.from(props.statement),
        privateData: Field(res.data.value),
        signature: Signature.fromBase58(res.signature),
        address: PrivateKey.random().toPublicKey(), // mina account address
      });

      setAttestation(attest);
      setIsAttestValid(attest.isValid().toBoolean());
    },
    [props.statement]
  );

  // when the statement is updated, re-compute the attestation validity
  useEffect(() => {
    // re-compute the attestation validity only if it has been computed before
    if (attestation) {
      attestation.statement = ProvableStatement.from(props.statement);
      setIsAttestValid(attestation.isValid().toBoolean());
    }
  }, [props.statement, attestation]);

  return (
    <div className="flex">
      <div className="ring-slate-200 bg-slate-800 px-5 py-3 rounded-xl flex flex-col gap-2">
        <h1 className="text-xl text-slate-100 text-center mb-2">
          Statement to prove
          <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />
        </h1>

        <StatementDefinition
          statement={props.statement}
          setStatement={props.setStatement}
        />
        <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />
        <div className="self-center">
          <FetchSourceDataButton
            statement={props.statement}
            onClick={onFetchSourceData}
            fetchSourceData={fetchSourceData}
            isPending={isPending}
          />
          {attestation && (
            <span className="ml-2 text-2xl text-white px-2 py-1 min-w-[20px] min-h-[20px] rounded-full bg-blue-500">
              {attestation?.privateData.toString()}
            </span>
          )}
        </div>
        {attestation && (
          <>
            <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />
            <StatementValidity
              statement={props.statement}
              attestation={attestation}
              isAttestValid={isAttestValid}
            />
            <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />
            <GenerateProofButton
              attestation={attestation}
              isPending={isPending}
              isAttestValid={isAttestValid}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProveStatement;
