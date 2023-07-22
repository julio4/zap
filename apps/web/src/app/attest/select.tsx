import React, { useState, useContext } from "react";
import axios from "axios";

import {
  StatementChoices,
  StatementChoice,
  Condition,
  HTMLInputSchema,
  Statement,
} from "../../types";
import { AttestContext } from "../../components/context/attestContext";

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

    console.log("statement", statement);

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
      console.log("oracle response", response);
      attest.setStatement(statement);
    } catch (e: any) {
      console.error("oracle error", e);
      setError(e.message);
      reset();
    }

    setWaiting({
      status: false,
      message: "",
    });
  };

  if (error)
    return (
      <div className="border-2 border-red-500 p-4 rounded-xl bg-red-100">
        <p>Error: {error}</p>
        <button onClick={reset}>Close</button>
      </div>
    );

  if (waiting.status)
    return (
      <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
        <p>Loading ...</p>
        <p>{waiting.message}</p>
      </div>
    );

  return (
    <div>
      {choice == null && (
        <div>
          <p>Select the attestation you want to make.</p>
          {StatementChoices.map((choice) => (
            <div
              key={choice.name}
              className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100"
            >
              <h3>{choice.name}</h3>
              <p>{choice.description}</p>
              <button
                onClick={() => {
                  setChoice(choice);
                  setCondition(choice.possibleConditions[0]);
                }}
              >
                Select
              </button>
            </div>
          ))}
        </div>
      )}
      {choice != null && (
        <div>
          <p>You have selected {choice.name}.</p>
          <form>
            <div className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100">
              <h3>Args</h3>
              {choice.args.map((arg) => (
                <div key={arg.name}>
                  <label>{arg.label}</label>
                  <input
                    type={arg.type}
                    value={args.find((a) => a.name === arg.name)?.value || ""}
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
              <label>Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
              >
                {choice.possibleConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>

              <label>Target Value</label>
              <input
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
              />
            </div>
          </form>
          <button onClick={reset}>Cancel</button>
          <button onClick={handleSelect}>Select</button>
        </div>
      )}
    </div>
  );
};

export { SelectStep };
