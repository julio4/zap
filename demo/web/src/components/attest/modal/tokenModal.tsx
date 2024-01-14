import React from "react";
import { TokenBalance } from "../../../types";

interface TokenModalProps {
    tokens: TokenBalance[];
    onSelect: (tokenAddress: string, tokenName: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

const fetchLogo = (token: TokenBalance) => {
    if (token.token.logo.small == null) {
        return "/assets/placeholder-question-mark.png"
    }
    else {
        const externalImageUrl = token.token.logo.small;
        const proxiedImageUrl = `/api/image-proxy?url=${encodeURIComponent(externalImageUrl)}`;
        console.log("proxiedImageUrl", proxiedImageUrl);
        return proxiedImageUrl;
    }
}

const TokenModal: React.FC<TokenModalProps> = ({ tokens, onSelect, onClose, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-slate-800 rounded-lg overflow-hidden w-1/2">
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">Select a Token</h3>
                </div>
                <ul className="max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-4">
                            <div className="spinner"></div>
                            <span className="text-white ml-3">Loading tokens...</span>
                        </div>
                    ) : tokens.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto">
                            {tokens.map((token, index) => (
                                <li
                                    key={token.tokenAddress}
                                    onClick={() => onSelect(token.tokenAddress, token.token.name)}
                                    className="cursor-pointer hover:bg-slate-700 p-4 border-b border-slate-600 text-white"
                                >
                                    <div className="flex justify-between items-center">

                                        <div className="flex items-center">
                                            {<img src={(fetchLogo(token as any))} alt="" className="w-6 h-6 mr-2" />}

                                            <h4 className="text-sm font-semibold">{token.token.name}</h4>
                                        </div>
                                        <div className="text-sm font-semibold">{token.formattedAmount}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <li className="text-center text-white py-4">No tokens found.</li>
                    )}
                </ul>
                <div className="flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="text-white bg-gradient-to-r from-indigo-500 to-sky-400 hover:bg-gradient-to-bl font-medium rounded-lg text-sm px-5 py-2.5"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenModal;
