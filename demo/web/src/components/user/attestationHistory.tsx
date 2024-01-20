import React, { useState } from "react";
import AttestationSidebar from "./attestationSidebar";

interface AttestationHistoryProps {
    attestations: any[];
    isLoading: boolean;
}

const AttestationHistory: React.FC<AttestationHistoryProps> = ({ attestations, isLoading }) => {
    const hardcodedAttestations = ["Attestation 1", "Attestation 2", "Attestation 3", "Attestation 4", "Attestation 5"];
    const [selectedAttestation, setSelectedAttestation] = useState<any>(null);


    const handleClick = (attestation: any) => {
        if (attestation === selectedAttestation) {
            setSelectedAttestation(null);
            return;
        }
        setSelectedAttestation(attestation);
    }

    return (
        <div className="flex flex-col py-4 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="py-2 text-center inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-6xl tracking-tight text-transparent">
                Attestation History
            </h2>
            <p className="font-light mt-3 text-sm text-center tracking-tight text-slate-400 max-w-xl mx-auto">
                You can see here all the attestations you have made in the past.
            </p>

            <div className="mt-6 w-full grid grid-cols-1 gap-4">
                {hardcodedAttestations.map((attestation, index) => (
                    <div
                        key={index}
                        className="cursor-pointer ring-slate-200 hover:ring-slate-300 bg-slate-800/75 hover:bg-slate-700/75 px-5 py-3 rounded-xl hover:scale-[1.02] duration-300 ease-in-out transition-all"
                        onClick={() => handleClick(attestation)}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <h4 className="text-sm font-semibold">{attestation}</h4>
                            </div>
                            <div className="text-sm font-semibold">Date</div>
                        </div>
                    </div>
                ))}
            </div>
            {selectedAttestation && <AttestationSidebar attestation={selectedAttestation} />}
        </div >
    );
}

export default AttestationHistory;
