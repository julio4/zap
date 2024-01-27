"use client";
import React from "react";
import { AttestProvider } from "../components/context/attestContext";
import { Header } from "../components/Header";
import { Attest } from "../components/attest/attest";
import Image from "next/image";

import { MinaWallet } from "../components/MinaWallet";
import { EthereumWallet } from "../components/EthereumWallet";
import { FoldingBg } from "../components/logo";
import { UserDataProvider } from "../components/context/userDataContext";

export default function AttestRoot() {
  return (
    <AttestProvider>
      <UserDataProvider>
        <Header
          MinaWalletComponent={<MinaWallet />}
          EthereumWalletComponent={<EthereumWallet />}
        />

        <div className="fixed z-10 top-14 left-4">
          <Image
            src="/assets/blur-cyan.png"
            alt="Blur Cyan"
            width={530}
            height={530}
            decoding="async"
            fetchPriority="high"
            style={{ color: "transparent" }}
            className="scale-[2.2] bottom-full right-full -mb-56 -mr-72 opacity-50"
          />
        </div>

        <div className="fixed inset-x-[-50vw] -bottom-48 -top-32 [mask-image:linear-gradient(transparent,white,white)] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:-bottom-32 lg:-top-32 lg:left-[calc(50%+14rem)] lg:right-0 lg:[mask-image:none] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
          <FoldingBg />
        </div>

        <div className="fixed inset-x-[-50vw] -bottom-48 -top-32 [mask-image:linear-gradient(transparent,white,white)] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:-bottom-32 lg:-top-32 lg:left-[calc(50%+14rem)] lg:right-0 lg:[mask-image:none] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
          <Image
            src="/assets/blur-cyan.png"
            alt="Blur Cyan"
            width={530}
            height={530}
            decoding="async"
            fetchPriority="high"
            style={{ color: "transparent" }}
            className="absolute -right-20 -top-11"
          />
          <Image
            src="/assets/blur-indigo.png"
            alt="Blur Indigo"
            width={567}
            height={567}
            decoding="async"
            fetchPriority="high"
            style={{ color: "transparent" }}
            className="absolute -bottom-7 -right-56"
          />
        </div>

        <div className="flex flex-col h-1/2 justify-center items-center">
          <div className="container mx-auto">
            <Attest />
          </div>
        </div>
      </UserDataProvider>
    </AttestProvider>
  );
}
