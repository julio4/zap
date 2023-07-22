import React from "react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
        <h1 className="mx-auto text-center text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-8xl">
          <span className="block bg-gradient-to-r from-brandred to-brandblue bg-clip-text text-transparent px-2">
            ZAP - ZK Attestation Protocol on Mina!
          </span>
        </h1>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 place-content-evenly">
          TODO
        </div>
      </main>
    </div>
  );
}
