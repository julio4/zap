"use client";
import { useState, useEffect } from "react";
import { Source } from "@zap/core/build/src/registry/Source";

export default function Sources() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetch("/mock_sources.json")
      .then((response) => response.json())
      .then(setSources);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-xl font-bold mb-8">Registered Sources</h1>
      <div className="w-full max-w-3xl p-4">
        {sources.map((source: Source) => (
          <div key={source.id} className="p-4 mb-4 rounded shadow bg-white">
            <h2 className="text-lg font-semibold">{source.name}</h2>
            <p>{source.description}</p>
            <p className="text-sm">API URL: {source.urlApi}</p>
            <p className="text-sm">Public Key: {source.publicKey}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
