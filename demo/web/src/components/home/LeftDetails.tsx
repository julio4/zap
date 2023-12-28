import React from "react";
import Image from "next/image";
import Link from "next/link";

const LeftDetails = () => {
  return (
    <div className="relative z-10 md:text-center lg:text-left">
      <Image
        src="/assets/blur-cyan.png"
        alt="Blur Cyan"
        width={530}
        height={530}
        decoding="async"
        fetchPriority="high"
        style={{ color: 'transparent' }}
        className="absolute bottom-full right-full -mb-56 -mr-72 opacity-50"
      />
      <div className="relative">
        <p className="inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-5xl tracking-tight text-transparent">
          Supercharging privacy with zero-knowledge wizardry!
        </p>
        <p className="font-light mt-3 text-2xl tracking-tight text-slate-400">
          Create zero-knowledge attestation about your on-chain activity, ensuring utmost confidentiality while building trust in digital interactions.
        </p>
        <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
          <Link href="/attest"
            className="rounded-full bg-sky-300 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-sky-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500">
            Get started
          </Link>
          <Link target="_blank" href="https://github.com/julio4/zap"
            className="rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:text-slate-400">
            View on GitHub
          </Link>
        </div>
      </div>
    </div>
  );
};

export {
  LeftDetails
}