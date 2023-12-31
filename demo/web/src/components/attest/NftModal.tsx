import React from "react";
import { TokenNft } from "../../types"; // Assuming you have a similar type for NFTs

interface NFTModalProps {
    nfts: TokenNft[];
    onSelect: (nftAddress: string, tokenId: string) => void;
    onClose: () => void;
    isLoading: boolean;
}

const fetchNFTImage = (nft: TokenNft) => {
    return nft.contentValue.image?.original || "/assets/placeholder-question-mark.png";
}

const NFTModal: React.FC<NFTModalProps> = ({ nfts, onSelect, onClose, isLoading }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-slate-800 rounded-lg overflow-hidden w-1/2">
                <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">Select an NFT</h3>
                </div>
                <ul className="max-h-64 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-4">
                            <div className="spinner"></div>
                            <span className="text-white ml-3">Loading NFTs...</span>
                        </div>
                    ) : nfts.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto">
                            {nfts.map((nft, index) => (
                                <li
                                    key={nft.tokenId}
                                    onClick={() => onSelect(nft.address, nft.tokenId)}
                                    className="cursor-pointer hover:bg-slate-700 p-4 border-b border-slate-600 text-white"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <img src={fetchNFTImage(nft)} alt="" className="w-12 h-12 mr-2 object-cover" />

                                            <div>
                                                {/* <h4 className="text-sm font-semibold">{nft.tokenName}</h4> */}
                                                <p className="text-xs text-gray-400">Token ID: {nft.tokenId}</p>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <li className="text-center text-white py-4">No NFTs found.</li>
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

export default NFTModal;
