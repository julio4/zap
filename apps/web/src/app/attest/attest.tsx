import { useEffect, useContext } from "react";
import { AttestContext } from "../../components/context/attestContext";
import { MinaWallet } from "../../components/MinaWallet";
import { EthereumWallet } from "../../components/EthereumWallet";
import { SelectStep } from "./select";

export default function Attest() {
  const attest = useContext(AttestContext);

  // Import contract
  useEffect(() => {
    (async () => {
      console.log("Loading snarkyjs and zkApp");
      const { Mina, PublicKey } = await import("snarkyjs");
      const { Add } = await import("@contracts/zap/build/src/");

      // Update this to use the address (public key) for your zkApp account.
      // To try it out, you can try this address for an example "Add" smart contract that we've deployed to
      // Berkeley Testnet B62qkwohsqTBPsvhYE8cPZSpzJMgoKn4i1LQRuBAtVXWpaT4dgH6WoA.
      const zkAppAddress = process.env["ZK_APP"];
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

  // 1: Connect wallets
  const step1 = !(
    attest.minaWallet.isConnected && attest.ethereumWallet.isConnected
  );
  // 2: Select statement, condition and sign -> get signed values from oracle
  const step2 = !step1 && attest.ethereumWallet.signature == "";
  // 3: Generate proof and send tx on Mina ZAP contract
  const step3 = !step1 && !step2;
  // 4: Generate attestation note/confirmation

  return (
    <div>
      <MinaWallet />
      <EthereumWallet />
      {step1 && !step2 && (
        <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP1
          <p>
            Please connect your wallets! Your ethereum wallet will be the source
            of data for the attestation. Your mina wallet will be used to submit
            and save the attestation on the ZAP protocol on Mina. There will be
            no association between your ethereum and mina wallets.
          </p>
        </div>
      )}
      {step2 && !step3 && (
        <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP2
          <SelectStep />
        </div>
      )}
      {step3 && (
        <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP3
          <p>Generating proof and send tx on Mina ZAP contract!</p>
        </div>
      )}
      {/* <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
          STEP4
          <p>
            Get the attestation note (don't lose it!).
          </p>
        </div> */}
    </div>
  );
}
