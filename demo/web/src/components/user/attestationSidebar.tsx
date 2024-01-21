import React from "react";

import { AttestationNote } from "../../types";

const AttestationSidebar = ({ attestation }: { attestation: AttestationNote }) => {
    return (
        <div className="fixed right-0 h-3/4 w-1/2 bg-slate-700/40 shadow-lg z-99 my-auto mr-4 rounded-xl overflow-y-auto">
            <div className="flex flex-col py-12 px-8">
                <div className="text-center mb-8">
                    <h3 className="py-2 inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-5xl tracking-tight text-transparent">
                        Attestation Details
                    </h3>
                </div>

                <div className="px-4">
                    <div className="mb-4">
                        <h4 className="text-xl text-white">Statement:</h4>
                        <p className="text-lg text-gray-300">{attestation.statement}</p>
                    </div>
                    <div className="mb-4">
                        <h4 className="text-xl text-white">Attestation Hash:</h4>
                        <p className="text-lg text-gray-300">{attestation.attestationHash}</p>
                    </div>
                    <hr className="border-t border-gray-600" />

                    <div className="my-4">
                        <h4 className="text-xl text-white">Hash Route:</h4>
                        <p className="text-lg text-gray-300">{attestation.hashRoute}</p>
                    </div>
                    <hr className="border-t border-gray-600" />
                    <div className="my-4">
                        <h4 className="text-xl text-white">Sender:</h4>
                        <p className="text-lg text-gray-300">{attestation.sender}</p>
                    </div>
                    <hr className="border-t border-gray-600" />
                    <div className="my-4">
                        <h4 className="text-xl text-white">Target Value:</h4>
                        <p className="text-lg text-gray-300">{attestation.targetValue}</p>
                    </div>
                    <hr className="border-t border-gray-600" />
                    <div className="my-4">
                        <h4 className="text-xl text-white">Condition Type:</h4>
                        <p className="text-lg text-gray-300">{attestation.conditionType}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AttestationSidebar;
