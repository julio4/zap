import React from "react";

import { AttestationNote, Condition } from "../../types";
import { noteToBase64 } from "../../utils/base64Attestation";

const AttestationSidebar = ({
  attestation,
}: {
  attestation: AttestationNote;
}) => {
  const handleCopyClick = () => {
    navigator.clipboard.writeText(
      window.location.origin + `/verify?note=${noteToBase64(attestation)}`
    );
  };

  return (
    <div className="fixed right-0 h-3/4 w-1/2 bg-slate-700/40 shadow-lg z-99 mr-4 rounded-xl overflow-y-auto custom-scrollbar">
      <div className="flex flex-col py-12 px-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <h3 className="inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-5xl tracking-tight text-transparent">
            Attestation Details
          </h3>
          <button
            onClick={handleCopyClick}
            className="mt-6 mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg hover:bg-gradient-to-br focus:outline-none focus:ring"
          >
            Copy link of attestation
          </button>
        </div>

        <div className="px-4">
          <div className="mb-4">
            <h4 className="text-lg text-white">Statement:</h4>
            <p className="text-sm text-gray-300">{attestation.statement}</p>
          </div>
          <div className="mb-4">
            <h4 className="text-lg text-white">Attestation Hash:</h4>
            <p className="text-sm text-gray-300">
              {attestation.attestationHash}
            </p>
          </div>
          <hr className="border-t border-gray-600" />

          <div className="my-4">
            <h4 className="text-lg text-white">Hash Route:</h4>
            <p className="text-sm text-gray-300">{attestation.hashRoute}</p>
          </div>
          <hr className="border-t border-gray-600" />
          <div className="my-4">
            <h4 className="text-lg text-white">Sender:</h4>
            <p className="text-sm text-gray-300">{attestation.sender}</p>
          </div>
          <hr className="border-t border-gray-600" />
          <div className="my-4">
            <h4 className="text-lg text-white">Target Value:</h4>
            <p className="text-sm text-gray-300">{attestation.targetValue}</p>
          </div>
          <hr className="border-t border-gray-600" />
          <div className="my-4">
            <h4 className="text-lg text-white">Condition Type:</h4>
            <p className="text-sm text-gray-300">{attestation.conditionType}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttestationSidebar;
