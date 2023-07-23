"use client";
import React, { useState, useContext } from "react";
import axios from "axios";

import {
  StatementChoices,
  StatementChoice,
  Condition,
  HTMLInputSchema,
  Statement,
  SignResponse,
} from "../../types";
import { AttestContext } from "../context/attestContext";
import { Encoding, Field, Poseidon, PublicKey, Signature } from "snarkyjs";

const ORACLE_ENDPOINT = process.env["ORACLE_ENDPOINT"];
if (!ORACLE_ENDPOINT) throw new Error("ORACLE_ENDPOINT is not set");

// Select the attestation choice and sign
const SelectStep = () => {
  const attest = useContext(AttestContext);
  const [choice, setChoice] = useState<StatementChoice | null>(null);
  const [args, setArgs] = useState<
    {
      name: string;
      schema: HTMLInputSchema;
      value: string;
    }[]
  >([]);
  const [condition, setCondition] = useState<Condition>(Condition.GREATER_THAN);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [waiting, setWaiting] = useState<{
    status: boolean;
    message: string;
  }>({ status: false, message: "" });

  const reset = () => {
    setChoice(null);
    setError(null);
    setArgs([]);
    setTargetValue(0);
    setCondition(Condition.GREATER_THAN);
  };

  const handleSelect = async () => {
    choice?.args.forEach((arg) => {
      const t_arg = args.find((a) => a.name === arg.name);
      if (!t_arg) {
        setError(`Please fill in '${arg.label}'`);
        return;
      }
      const value = t_arg.value;
      if (!value || value === "") {
        setError(`Please fill in '${arg.label}'`);
        return;
      }
      if (arg.type === "number") {
        if (isNaN(Number(value))) {
          setError(`'${arg.label}' must be a number`);
          return;
        }
      }
    });

    if (!choice) {
      setError("Please select a statement");
      return;
    }

    const statement: Statement = {
      request: {
        route: choice?.route,
        // map args to a object with key value pairs of args.name: args.value
        args: Object.fromEntries(
          choice?.args.map((arg) => {
            const t_arg = args.find((a) => a.name === arg.name);
            return [arg.name, t_arg?.value];
          })
        ),
      },
      condition: {
        type: condition,
        targetValue,
      },
    };

    // Make request to oracle to get signed values
    setWaiting({
      status: true,
      message: "Requesting signed values from oracle...",
    });

    const request_data = {
      address: attest.ethereumWallet.address,
      signature: attest.ethereumWallet.signature,
      args: statement.request.args,
    };

    try {
      const response = await axios.post(
        `${ORACLE_ENDPOINT}${statement.request.route}`,
        request_data
      );

      // TODO: remove this part later
      // example of decoding
      const body = response.data as SignResponse;
      console.log("body", body)

      // const data = Encoding.stringToFields(body.data);
      const data = body.data.map(f => Field.from(f));
      console.log("data", data.toString())

      // signature verification
      // TODO ASSERT(body.publicKey === node.process["ORACLE_PUBLIC_KEY"])
      // -> will be asserted in the proof as well so ok to skip it here
      const signature = Signature.fromBase58(body.signature);
      console.log("signature", signature.toBase58())
      const publicKey = PublicKey.fromBase58(body.publicKey);
      console.log("publicKey", publicKey.toBase58())
      const decoded: {
        value: number;
        hashRoute: string;
      } = JSON.parse(Encoding.stringFromFields(data));
      console.log("decoded", decoded)

      // We can verify here but really the most important is to verify within the proof
      const verified = signature.verify(publicKey, data);
      if (!verified.toBoolean()) {
        throw new Error('Signature verification failed');
      }

      const localRouteFields = Encoding.stringToFields(JSON.stringify(statement.request))
      const localHashRoute = Poseidon.hash(localRouteFields).toString();

      if (decoded.hashRoute !== localHashRoute) {
        throw new Error('Hash route verification failed');
      }

      // States changes
      attest.setStatement(statement);
      attest.setPrivateData({
        ...body,
        data: decoded
      });
    } catch (e: any) {
      console.error("oracle error", e);
      setError(e.message);
    }

    setWaiting({
      status: false,
      message: "",
    });
  };

  if (error)
    return (
      <div className="py-4 border-2 border-red-700/75 p-4 rounded-xl bg-red-600/50">
        <p className="text-slate-600">Error: {error}</p>
        <button onClick={reset} className="text-slate-600">Close</button>
      </div>
    );

  if (waiting.status)
    return (
      <div className="border-2 border-slate-500/75 p-4 rounded-xl bg-slate-700/50">
        <p>Loading ...</p>
        <p>{waiting.message}</p>
      </div>
    );

  return (
    <div className="relative pt-4">
      {choice == null && (
        <div className="absolute w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {StatementChoices.map((choice) => (
            <div
              key={choice.name}
              className="cursor-pointer ring-slate-200 hover:ring-slate-300 bg-slate-800/75 hover:bg-slate-700/75 px-5 py-3 rounded-xl hover:scale-[1.02] duration-300 ease-in-out transition-all"
              onClick={() => {
                setChoice(choice);
                setCondition(choice.possibleConditions[0]);
              }}
            >
              <h3 className="text-xl bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent">
                {choice.name}</h3>
              <p className="text-slate-400 text-sm">{choice.description}</p>
            </div>
          ))}
        </div>
      )}
      {choice != null && (
        <div className="absolute w-full">
          <div className="cursor-pointer ring-slate-200 bg-slate-800/75 px-5 py-3 rounded-xl flex flex-col">

            <h3 className="text-xl bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent">
              {choice.name}
            </h3>
            <p className="text-slate-400 text-sm">{choice.description}</p>

            <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />

            <div className="flex flex-col gap-2">
              {choice.args.map((arg) => (
                <div key={arg.name} className="flex flex-row gap-2 justify-between">
                  <label className="text-slate-400">{arg.label}</label>
                  <input
                    type={arg.type}
                    value={args.find((a) => a.name === arg.name)?.value || ""}
                    className="border-2 border-slate-500 rounded-md bg-slate-600/50 text-slate-100"
                    onChange={(e) => {
                      setArgs([
                        ...args.filter((a) => a.name !== arg.name),
                        {
                          name: arg.name,
                          schema: arg,
                          value: e.target.value,
                        },
                      ]);
                    }}
                  />
                </div>
              ))}
            </div>

            <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />

            <div className="flex flex-row gap-2 justify-between">
              <label className="text-slate-400">Condition</label>
              <select
                value={condition}
                className="border-2 border-slate-500 rounded-md bg-slate-600/50 text-slate-100"
                onChange={(e) => setCondition(e.target.value as Condition)}
              >
                {choice.possibleConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>

              <label className="text-slate-400">Target Value</label>
              <input
                type="number"
                className="border-2 border-slate-500 rounded-md bg-slate-600/50 text-slate-100"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
              />
            </div>

            <hr className="w-48 h-1 mx-auto my-2 border-0 rounded md:my-4 dark:bg-slate-700" />

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSelect}
                type="button"
                className="transition-all hover:scale-[1.02] duration-200 ease-in-out text-white bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-300 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-sky-300 dark:focus:ring-sky-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 opacity-80">
                Select
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export { SelectStep };
