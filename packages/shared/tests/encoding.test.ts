import { encodeResAsFields } from "../src/index.js";
import { Encoding, Field, Poseidon } from "o1js";
import { ZapHashedResponse } from "@zap/types";

describe("Encoding", () => {
  it("encodeResAsFields", () => {
    const res: ZapHashedResponse = {
      value: 10,
      hashRoute: Poseidon.hash(
        Encoding.stringToFields(
          JSON.stringify({
            path: "/path",
            args: {
              id: "id",
            },
          })
        )
      ).toString(),
    };
    expect(encodeResAsFields(res)).toEqual(
      [res.value, res.hashRoute].map((value) => Field.from(value))
    );
  });
});
