import React, { useState, useEffect } from "react";
import AttestationSidebar from "./attestationSidebar";
import { AttestationNote } from "../../types";
import { decodeAttestationNote } from "../../utils/base64Attestation";
import { getAttestationNotesFromLocalStorage } from "../../utils/localStorageAttestation";

interface AttestationHistoryProps {
  attestations: AttestationNote[];
  isLoading: boolean;
}

const AttestationHistory: React.FC<AttestationHistoryProps> = ({
  attestations,
  isLoading,
}) => {
  const [attestationsNotes, setAttestationsNotes] = useState<AttestationNote[]>(
    []
  );
  const [selectedAttestation, setSelectedAttestation] = useState<any>(null);

  const handleClick = (attestation: any) => {
    if (attestation === selectedAttestation) {
      setSelectedAttestation(null);
      return;
    }
    setSelectedAttestation(attestation);
  };

  const truncate = (str: string, n: number) => {
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  const extractRouteFromString = (str: string) => {
    const regex = /for ([^ ]+) with/;
    const match = str.match(regex);
    return match ? match[1] : null;
  };

  useEffect(() => {
    const attestations = getAttestationNotesFromLocalStorage();
    if (attestations) {
      const decodedAttestations = attestations.map((attestation) =>
        decodeAttestationNote(attestation)
      );
      console.log(decodedAttestations);
      setAttestationsNotes(decodedAttestations);
    }
  }, []);

  return (
    <div
      className={`flex flex-col py-4 max-w-7xl px-4 sm:px-6 lg:px-8 ${
        selectedAttestation ? "w-2/5" : "w-1/2  mx-auto"
      }`}
    >
      <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
        Attestation History
      </h2>
      <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
        You can see here all the attestations you have made in the past.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 ">
        {attestationsNotes.map((attestation, index) => (
          <div
            key={index}
            className="cursor-pointer ring-slate-200 hover:ring-slate-300 bg-slate-800/75 hover:bg-slate-700/75 px-10 py-3 rounded-xl hover:scale-[1.02] duration-300 ease-in-out transition-all"
            onClick={() => handleClick(attestation)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h4 className="text-sm font-semibold text-slate-100">
                  {extractRouteFromString(attestation.statement)}
                </h4>
              </div>
              <div className="flex items-center">
                {" "}
                <h4 className="text-sm font-semibold text-slate-100">
                  {truncate(attestation.attestationHash, 10)}
                </h4>
              </div>
              <div className="text-sm font-semibold text-slate-100">
                17/06/2023
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedAttestation && (
        <AttestationSidebar attestation={selectedAttestation} />
      )}
    </div>
  );
};

export default AttestationHistory;
