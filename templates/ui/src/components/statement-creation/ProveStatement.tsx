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

const generateFakeData = (): ZapSignedResponse => {
  const pk = PrivateKey.random();
  return {
    data: {
      value: Math.floor(Math.random() * 10000),
      hashRoute: "fake hash route",
    },
    signature: Signature.create(pk, [Field(0)]).toBase58(),
    publicKey: pk.toPublicKey().toBase58(),
  };
};

interface ProveStatementProps {
  statement: Statement;
  setStatement: React.Dispatch<React.SetStateAction<Statement>>;
}

const ProveStatement = (props: ProveStatementProps) => {
  const [attestation, setAttestation] = useState<Attestation>();
  const [isAttestValid, setIsAttestValid] = useState(false);
  const [fakeSourceData, setFakeSourceData] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const {
    mutateAsync: fetchSourceData,
    isPending,
    isError,
  } = useFetchDataFromSource();

  const onFetchSourceData = useCallback(
    (res: ZapSignedResponse) => {
      try {
        const attest = new Attestation({
          statement: ProvableStatement.from(props.statement),
          privateData: Field(res.data.value),
          signature: Signature.fromBase58(res.signature),
          address: PrivateKey.random().toPublicKey(), // mina account address
        });

        setAttestation(attest);
        setIsAttestValid(attest.isValid().toBoolean());
      } catch (e) {
        console.error(e);
        setError("Error while creating attestation");
      }
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
      <div className="w-full ring-slate-200 bg-slate-800 px-5 py-3 rounded-xl flex flex-col gap-2">
        <h1 className="text-xl text-slate-100 text-center mb-2">
          Statement to prove
          <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />
        </h1>

        <StatementDefinition
          statement={props.statement}
          setStatement={props.setStatement}
        />
        <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />
        <div className="self-center flex flex-col">
          <FetchSourceDataButton
            statement={props.statement}
            onClick={onFetchSourceData}
            fetchSourceData={fetchSourceData}
            isPending={isPending}
            isError={isError}
            fakeCall={fakeSourceData}
            fakeData={generateFakeData()}
          />

          {/* Mini Checkbox for faking data */}
          <div>
            <input
              type="checkbox"
              checked={fakeSourceData}
              onChange={(e) => setFakeSourceData(e.target.checked)}
            />
            <label className="ml-1 text-sm text-gray-500">
              Fake source data (validation will fail)
            </label>
          </div>
        </div>

        {/* Small error footer */}
        <div className="text-red-500 text-sm text-center">{error}</div>

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
