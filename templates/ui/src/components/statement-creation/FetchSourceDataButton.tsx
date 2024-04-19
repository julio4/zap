import React, { useCallback } from "react";
import {
  UseMutateAsyncFunction,
  UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { ZapSignedResponse, ZapRequestParams, Statement } from "@zap/types";
import axios from "axios";

const callSource = async (statement: Statement): Promise<ZapSignedResponse> => {
  const req = {
    mina_address: "B62qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    args: statement.route.args,
  } as ZapRequestParams;

  return (await axios.post(`http://localhost:3010${statement.route.path}`, req))
    .data;
};

export const useFetchDataFromSource = (): UseMutationResult<
  ZapSignedResponse,
  Error,
  Statement,
  unknown
> =>
  useMutation({
    mutationFn: (stmt: Statement) => callSource(stmt),
  });

interface FetchSourceDataButtonProps {
  statement: Statement;
  onClick: (res: ZapSignedResponse) => void;
  fetchSourceData: UseMutateAsyncFunction<
    ZapSignedResponse,
    Error,
    Statement,
    unknown
  >;
  isPending: boolean;
}

const FetchSourceDataButton = (props: FetchSourceDataButtonProps) => {
  const fetchPrivateData = useCallback(async () => {
    const res: ZapSignedResponse = await props.fetchSourceData(props.statement);
    console.log("reqRes----");
    console.log(res);

    props.onClick(res);
  }, [props]);

  return (
    <button
      type="button"
      className={`min-w-fit w-[30%] p-2 mt-auto bg-slate-700 text-white py-2 rounded
        ${
          props.statement.condition.targetValue == Infinity
            ? "opacity-60"
            : "hover:bg-slate-600"
        }`}
      onClick={fetchPrivateData}
      disabled={
        props.statement.condition.targetValue == Infinity || props.isPending
      }
    >
      {props.isPending ? "Loading..." : "Fetch private data"}
    </button>
  );
};

export default FetchSourceDataButton;
