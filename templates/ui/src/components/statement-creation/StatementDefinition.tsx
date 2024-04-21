import React from "react";
import { Statement } from "@zap/types";
import StatementSelection from "./StatementSelection";

interface StatementDefinitionProps {
  statement: Statement;
  setStatement: React.Dispatch<React.SetStateAction<Statement>>;
}

const StatementDefinition = (props: StatementDefinitionProps) => (
  <>
    <div className="flex self-center gap-2">
      <h3 className="text-lg bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent">
        Source Key:
      </h3>
      <h3 className="ml-3 text-md text-slate-100 bg-clip-text font-display tracking-tight">
        {props.statement.sourceKey}
      </h3>
    </div>
    <StatementSelection
      statement={props.statement}
      setStatement={props.setStatement}
    />
  </>
);

export default StatementDefinition;
