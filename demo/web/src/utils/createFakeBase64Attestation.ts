import { Condition, OracleRoute } from "../types";
import { createAttestationNoteEncoded } from "./base64Attestation";

const fakeNote = createAttestationNoteEncoded(
  Condition.GREATER_THAN,
  1000,
  9000,
  {
    route: OracleRoute.BALANCE,
    args: {
      token: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      blockchain: "polygon",
    },
  },
  "24771613593952144968161186171837982514830394192519219838611160378286992541903",
  "17613068260150588986788240600449359622364004875948701399924500458447005281944",
  "B62qm3bbCSy8ixuacL8FJzWdoj9MBjQGgrzHwiHtksBHTtmFWhidKxS"
);

console.log("My fake note is: ", fakeNote);
