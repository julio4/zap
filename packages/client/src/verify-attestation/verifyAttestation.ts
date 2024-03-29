import { calculateAttestationHash } from "@zap/shared";
import { AttestationNote } from "@zap/types";
import { Provable, ProvablePure, UInt32, Mina, PublicKey } from "o1js";
import { Verifier } from "@zap/core";
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import { NotExistsError } from "../errors/verify-attestation/notExists.js";
import { DifferentHashError } from "../errors/verify-attestation/differentHash.js";
import { ExpiredError } from "../errors/verify-attestation/expired.js";
import { NotFoundInEventsError } from "../errors/verify-attestation/notFoundInEvents.js";
import { InvalidNoteError } from "../errors/verify-attestation/index.js";

const MINAURL = "https://proxy.berkeley.minaexplorer.com/graphql";
const ARCHIVEURL = "https://archive.berkeley.minaexplorer.com";
const VERIFIER_PUBLIC_KEY = "B62..."; // TODO move to .env

/**
 * Retrieve all events from the very first event ever emitted on our zap account
 * @returns the events
 */
const fetchZapEvents = async () => {
  const network = Mina.Network({
    mina: MINAURL,
    archive: ARCHIVEURL,
  });
  Mina.setActiveInstance(network);

  const verifier = new Verifier(PublicKey.fromBase58(VERIFIER_PUBLIC_KEY));
  const minaEvents: MinaEvent[] = await verifier.fetchEvents(UInt32.from(0));

  return minaEvents;
};

// could maybe put this type in packages/types but only used in this file (so far)
type MinaEvent = {
  type: string;
  event: {
    data: ProvablePure<any>;
    transactionInfo: {
      transactionHash: string;
      transactionStatus: string;
      transactionMemo: string;
    };
  };
  blockHeight: UInt32;
  blockHash: string;
  parentBlockHash: string;
  globalSlot: UInt32;
  chainStatus: string;
};

/**
 * Custom hook that verifies the attestation has not been tampered with and corresponds to an event previously emitted to our Zap protocol.
 * @param attestationNote the decoded attestion note you wish to verify
 * @returns either true if the verification is successful or an error indicating the verification failure reason
 * @throws VerifyAttestationError
 */
export const useVerifyAttestation = (
  attestationNote: AttestationNote
): UseMutationResult<boolean, Error, void, unknown> =>
  useMutation({
    mutationFn: () => verifyAttestation(attestationNote),
  });

const verifyAttestation = async (
  attestationNote: AttestationNote
): Promise<boolean> => {
  // we probably don't wanna call fetchZapEvents() every time we call verifyAttestation
  // or maybe move declaration of "network" and zap instance "zkapp" out of fetchZapEvents (as global variables?)
  const events = await fetchZapEvents();

  // First we make sure the attestation note has not been tampered with
  if (attestationNote == null) throw new NotExistsError();

  const recalculatedHash = calculateAttestationHash(
    attestationNote.conditionType,
    attestationNote.hashRoute,
    attestationNote.targetValue,
    attestationNote.sender
  );

  if (recalculatedHash !== attestationNote.attestationHash)
    throw new DifferentHashError();

  // Then we verify that the attestation hash is in the events
  for (let event of events) {
    let valueArray: Provable<any> = event.event.data;

    const currentHash = (valueArray as any).value[1][1][0];
    const validTill = (valueArray as any).value[1][1][1];

    // If attestation hash found in events
    if (BigInt(currentHash) === BigInt(attestationNote.attestationHash)) {
      // Then we verify that the timestamp is correct
      const now = new Date();
      const timestamp = now.getTime() / 1000;

      if (timestamp > validTill) throw new ExpiredError();

      return true;
    }
  }

  throw new NotFoundInEventsError();
};

/**
 * Decode the encoded attestation note, which you want to verify
 * @param encodedAttestationNote the encoded attestation note, which you want to decode
 * @returns the decoded attestation note
 * @throws InvalidNoteError
 */
export const decodeAttestationNote = (
  encodedAttestationNote: string
): AttestationNote => {
  // Replace all spaces with "+" (url encoded)
  const base64Attestation = encodedAttestationNote
    .toString()
    .replace(/ /g, "+");

  const jsonString = Buffer.from(base64Attestation, "base64").toString("utf-8");
  const attestation = JSON.parse(jsonString);

  // Throw error if the attestation is not valid (i.e wrong type with AttestationNote)
  if (
    // change the 'lib' compiler option to 'es2022' if you want to be able to use hasOwn()
    // instead of "in" (see below)
    // !Object.hasOwn(attestation, "attestationHash") ||
    // !Object.hasOwn(attestation, "statement") ||
    // !Object.hasOwn(attestation, "targetValue") ||
    // !Object.hasOwn(attestation, "conditionType") ||
    // !Object.hasOwn(attestation, "hashRoute") ||
    // !Object.hasOwn(attestation, "sender")
    !("attestationHash" in attestation) ||
    !("statement" in attestation) ||
    !("targetValue" in attestation) ||
    !("conditionType" in attestation) ||
    !("hashRoute" in attestation) ||
    !("sender" in attestation)
  ) {
    throw new InvalidNoteError();
  }

  return attestation as AttestationNote;
};
