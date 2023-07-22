"use client";
import { AttestProvider } from "../../components/context/attestContext";
import Attest from "./attest";

export default function AttestRoot() {
  return (
    <AttestProvider>
      <Attest />
    </AttestProvider>
  );
}
