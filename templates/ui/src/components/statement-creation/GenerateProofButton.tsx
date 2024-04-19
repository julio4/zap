import { Attestation } from "@zap/core";
import React, { useCallback, useMemo } from "react";

interface GenerateProofButtonProps {
  isPending: boolean;
  isAttestValid: boolean;
  attestation: Attestation;
}

const GenerateProofButton = (props: GenerateProofButtonProps) => {
  const generateProofAndSubmit = useCallback(() => {
    console.log("--- generateProofAndSubmit ---");
    console.log(props.attestation);
  }, [props.attestation]);

  const isDisabled = useMemo(
    () => props.isPending || !props.isAttestValid,
    [props.isPending, props.isAttestValid]
  );

  return (
    <button
      type="button"
      className={`min-w-fit w-[30%] p-2 self-center mt-auto bg-slate-700 text-white py-2 rounded
        ${isDisabled ? "opacity-60" : "hover:bg-slate-600"}
        `}
      onClick={generateProofAndSubmit}
      disabled={isDisabled}
    >
      Generate proof and submit
    </button>
  );
};

export default GenerateProofButton;
