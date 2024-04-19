import React, { useCallback } from "react";
import { ConditionType, Statement, conditionToString } from "@zap/types";

interface StatementSelectionProps {
  statement: Statement;
  setStatement: React.Dispatch<React.SetStateAction<Statement>>;
  disable?: boolean;
}

const StatementSelection = (props: StatementSelectionProps) => {
  const onTargetValueChange = useCallback(
    (value: number) => {
      props.setStatement((old) => ({
        ...old,
        condition: { ...old.condition, targetValue: value },
      }));
    },
    [props]
  );

  const onConditionChange = useCallback(
    (condition: ConditionType) =>
      props.setStatement((old) => ({
        ...old,
        condition: { ...old.condition, type: condition },
      })),
    [props]
  );

  return (
    <div className="flex gap-4 self-center justify-center space-x-8 w-fit">
      <div className="flex flex-col max-w-[300px]">
        <h3 className="text-xl bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent">
          {props.statement.route.path}
        </h3>
        {Object.entries(props.statement.route.args ?? []).map(
          ([key, value]) => (
            <span key={key} className="self-center text-sm text-slate-400">
              {key} : {value}
            </span>
          )
        )}
      </div>

      <select
        value={props.statement.condition.type}
        className="self-center text-center w-14 h-14 border-2 border-slate-500 rounded-md bg-slate-600/50 text-slate-100"
        onChange={(e) =>
          onConditionChange(e.target.value as unknown as ConditionType)
        }
        disabled={props.disable}
      >
        {Object.values(ConditionType)
          .filter((value) => !isNaN(Number(value)))
          .map((condition) => (
            <option key={condition} value={condition}>
              {conditionToString(condition as ConditionType)}
            </option>
          ))}
      </select>

      <input
        type="number"
        className={`self-center w-24 h-14 border-2 rounded-md bg-slate-600/50 text-slate-100 px-2 py-1
          ${
            props.statement.condition.targetValue == Infinity
              ? "border-red-500"
              : "border-slate-500"
          }
          `}
        value={props.statement.condition.targetValue}
        onChange={(e) => onTargetValueChange(Number(e.target.value))}
        disabled={props.disable}
      />
    </div>
  );
};

export default StatementSelection;
