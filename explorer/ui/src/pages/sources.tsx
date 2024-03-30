"use client";
import { useState, useEffect } from "react";
import { Source } from "@zap/core/build/src/registry/Source";
import Link from "next/link";

export default function Sources() {
  const [sources, setSources] = useState([]);

  useEffect(() => {
    fetch("/mock_sources.json")
      .then((response) => response.json())
      .then(setSources);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-6">
      <h1 className="text-3xl font-bold mb-12 text-gray-100">Registered Sources</h1>
      <div className="w-full max-w-4xl p-6">
        {sources.map((source: Source) => (
          <div key={source.id} className="p-6 mb-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-semibold text-gray-900">{source.name}</h2>
            <p className="mt-2 text-lg text-gray-700">{source.description}</p>
            <p className="mt-4 text-gray-600">API URL: <a href={source.urlApi} className="text-blue-500 hover:text-blue-600">{source.urlApi}</a></p>
            <p className="text-gray-600">Public Key: <span className="font-mono text-sm text-gray-500">{source.publicKey}</span></p>
          </div>
        ))}
      </div>
      <div className="my-4">
        <Link href="/" passHref>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
