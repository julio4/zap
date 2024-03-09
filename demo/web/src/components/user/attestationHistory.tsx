import React, { useState, useEffect } from "react";
import AttestationSidebar from "./attestationSidebar";
import { AttestationNote, AttestationNoteDated } from "../../types";
import { decodeAttestationNote } from "../../utils/base64Attestation";
import { useAttestationStore } from "@/utils/attestationStore";
interface AttestationHistoryProps { }

const AttestationHistory: React.FC<AttestationHistoryProps> = () => {
  const [selectedAttestation, setSelectedAttestation] = useState<any>(null);
  const attestations = useAttestationStore(state => state.attestationNotes);

  const attestationsNotesDated = attestations.map((attestationWithDate, index) => {
    const [date, base64Attestation] = attestationWithDate.split(/:(.+)/);
    const decodedAttestation = decodeAttestationNote(base64Attestation.trim());
    return {
      attestationNote: decodedAttestation,
      date,
    };
  });

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

  return (
    <div
      className={`flex flex-col py-4 max-w-7xl px-4 sm:px-6 lg:px-8 ${selectedAttestation ? "w-2/5" : "w-1/2  mx-auto"
        }`}
    >
      <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
        Attestation History
      </h2>
      <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
        You can see here all the attestations you have made in the past.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 ">
        {attestationsNotesDated.map((attestationDated, index) => (
          <div
            key={index}
            className="cursor-pointer ring-slate-200 hover:ring-slate-300 bg-slate-800/75 hover:bg-slate-700/75 px-10 py-3 rounded-xl hover:scale-[1.02] duration-300 ease-in-out transition-all"
            onClick={() => handleClick(attestationDated)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <h4 className="text-sm font-semibold text-slate-100">
                  {extractRouteFromString(attestationDated.attestationNote.statement)}
                </h4>
              </div>
              <div className="flex items-center">
                {" "}
                <h4 className="text-sm font-semibold text-slate-100">
                  {truncate(attestationDated.attestationNote.attestationHash, 10)}
                </h4>
              </div>
              <div className="text-sm font-semibold text-slate-100">
                {attestationDated.date}
              </div>
            </div>
          </div>
        ))}
        {attestationsNotesDated.length === 0 && (
          <div className="text-center text-slate-100">
            You have not made any attestations yet.
          </div>
        )}
      </div>
      {selectedAttestation && (
        <AttestationSidebar attestation={selectedAttestation} />
      )}
    </div>
  );
};

export default AttestationHistory;
