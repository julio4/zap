import React from "react";
import { TokenBalance } from "../../types";

interface TokenModalProps {
    tokens: TokenBalance[];
    onSelect: (tokenAddress: string) => void;
    onClose: () => void;
}

const TokenModal: React.FC<TokenModalProps> = ({ tokens, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-slate-800 rounded-lg overflow-hidden w-1/2">
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">Select a Token</h3>
                </div>
                <ul className="max-h-64 overflow-y-auto">
                    {tokens.map((token) => (
                        <li
                            key={token.tokenAddress}
                            onClick={() => onSelect(token.tokenAddress)}
                            className="cursor-pointer hover:bg-slate-700 p-4 border-b border-slate-600 text-white"
                        >
                            {token.token.name}
                        </li>
                    ))}
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