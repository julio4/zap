import React from "react";
import { Header } from "../components/Header";
import AttestationHistory from "../components/user/attestationHistory";

export default function AttestationHistoryPage(): JSX.Element {
  return (
    <>
      <Header />
      <AttestationHistory attestations={[]} isLoading={false} />
    </>
  );
}
