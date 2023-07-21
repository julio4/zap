"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    (async () => {
      console.log("Loading snarkyjs and zkApp");
      const { Mina, PublicKey } = await import("snarkyjs");
      const { Add } = await import("@contracts/zap/build/src/");

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      const zkAppAddress =
        "B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA";
      // This should be removed once the zkAppAddress is updated.
      if (!zkAppAddress) {
        console.error(
          'The following error is caused because the zkAppAddress has an empty string as the public key. Update the zkAppAddress with the public key for your zkApp account, or try this address for an example "Add" smart contract that we deployed to Berkeley Testnet: B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA'
        );
      }
      //const zkApp = new Add(PublicKey.fromBase58(zkAppAddress))
      console.log("zkAppAddress", zkAppAddress);
    })();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <main className="mx-auto w-auto px-4 pt-16 pb-8 sm:pt-24 lg:px-8">
        <h1 className="mx-auto text-center text-6xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl xl:text-8xl">
          Web
          <span className="block bg-gradient-to-r from-brandred to-brandblue bg-clip-text text-transparent px-2">
            Turborepo Example
          </span>
        </h1>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 place-content-evenly">
          TODO
        </div>
      </main>
    </div>
  );
}
