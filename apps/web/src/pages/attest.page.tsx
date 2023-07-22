"use client";
import React from "react";
import { AttestProvider } from "../components/context/attestContext";
import Attest from "../components/attest/attest";

export default function AttestRoot() {
  return (
    <AttestProvider>
      <Attest />
    </AttestProvider>
  );
}
