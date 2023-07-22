import React, { useState, useContext } from "react";
import {
  StatementChoices,
  StatementChoice,
  Condition,
  HTMLInputSchema,
} from "../../types";
import { AttestContext } from "../../components/context/attestContext";

// Select the attestation choice and sign
const SelectStep = () => {
  const attest = useContext(AttestContext);
  const [choice, setChoice] = useState<StatementChoice | null>(null);
  const [args, setArgs] = useState<
    {
      schema: HTMLInputSchema;
      value: string;
    }[]
  >([]);
  const [condition, setCondition] = useState<Condition>(Condition.GREATER_THAN);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setChoice(null);
    setError(null);
  };

  const handleSign = () => {
    // TODO
    console.log(" TODO handleSign");
    // fake sig for now
    attest.setEthereumWallet({
      ...attest.ethereumWallet,
      signature: "0x1234567890",
    });

    // Create Statement from statement choice, condition and args
    // assert good args and possible conditions ?? TODO

    // Make request to oracle to get signed values
  };

  if (error)
    return (
      <div className="border-2 border-red-500 p-4 rounded-xl bg-red-100">
        <p>Error: {error}</p>
        <button onClick={reset}>Close</button>
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
              <button onClick={() => setChoice(choice)}>Select</button>
            </div>
          ))}
        </div>
      )}
      {choice != null && (
        <div>
          <p>You have selected {choice.name}.</p>
          <form>
            {choice.args.map((arg) => (
              <div
                key={arg.label}
                className="border-2 border-gray-500 p-4 rounded-xl bg-gray-100"
              >
                <label>{arg.label}</label>
                <input
                  type={arg.type}
                  value={
                    args[arg.label as any] ? args[arg.label as any].value : ""
                  }
                  onChange={(e) => {
                    setArgs((prevArgs) => {
                      const newArgs = [...prevArgs];
                      newArgs[arg.label as any] = {
                        ...newArgs[arg.label as any],
                        value: e.target.value,
                      };
                      return newArgs;
                    });
                  }}
                />
              </div>
            ))}
          </form>
          <button onClick={reset}>Cancel</button>
          <button onClick={handleSign}>Sign</button>
        </div>
      )}
    </div>
  );
};

export { SelectStep };
