import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/router';

import { Header } from "../components/Header";
import { FoldingBg, Magnify, People } from "../components/logo";
import { Search } from "../components/Search";

type HomeProps = {};

export default function Home(props: HomeProps): JSX.Element {
  const router = useRouter();
  const { note } = router.query;

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [attestationNote, setAttestationNote] = useState("");

  useEffect(() => {
    if (note) {
      setAttestationNote(note as string);
    }
  }, [note]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setCursorPosition({ x, y });
  };

  return (
    <>
      <Header showSearch={attestationNote != ""}/>
      <div className="overflow-hidden flex flex-col justify-center lg:h-screen bg-slate-900 dark:-mb-32 dark:mt-[-4.5rem] dark:pb-32 dark:pt-[4.5rem] dark:lg:mt-[-4.75rem] dark:lg:pt-[4.75rem]">
        <div className="py-16 sm:px-2 lg:relative lg:px-0 lg:py-20">
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-7xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
            <div className="relative z-10 md:text-center lg:text-left">
              <Image
                src="/blur-cyan.png"
                alt="Blur Cyan"
                width={530}
                height={530}
                decoding="async"
                fetchPriority="high"
                style={{ color: "transparent" }}
                className="absolute bottom-full right-full -mb-56 -mr-72 opacity-50"
              />
              <div className="relative">
                <p className="inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-5xl tracking-tight text-transparent">
                  Verify your attestation
                </p>
                <p className="font-light mt-3 text-2xl tracking-tight text-slate-400">
                  All you need is the attestation note! It contains the proof
                  and all public inputs to be able to verify the attestation. It
                  also contains some additional information about the
                  attestation.
                </p>
              </div>
            </div>

            <div className="relative lg:static xl:pl-10">
              <div className="relative">
                <Image
                  src="/blur-cyan.png"
                  alt="Blur Cyan"
                  width={530}
                  height={530}
                  decoding="async"
                  fetchPriority="high"
                  style={{ color: "transparent" }}
                  className="absolute -right-64 -top-64"
                />
                <Image
                  src="/blur-indigo.png"
                  alt="Blur Indigo"
                  width={567}
                  height={567}
                  decoding="async"
                  fetchPriority="high"
                  style={{ color: "transparent" }}
                  className="absolute -bottom-40 -right-44"
                />

                <div className="not-prose flex flex-row justify-center">
                  {/* Card */}
                  {attestationNote != "" && (
                    <div
                      className="group relative flex rounded-2xl transition-shadow hover:shadow-md bg-slate-800/75 hover:shadow-black/5 z-50"
                      onMouseMove={handleMouseMove}
                    >
                      <div className="pointer-events-none">
                        <div
                          className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition duration-300 group-hover:opacity-100 to-[#161648] from-[#0c5553]"
                          style={{
                            maskImage: `radial-gradient(180px at ${cursorPosition.x}px ${cursorPosition.y}px, white, transparent)`,
                          }}
                        ></div>
                      </div>

                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20"></div>
                      <div className="relative rounded-2xl px-4 pb-4 pt-4 bg-gradient-to-r from-slate-700 to-slate-600">
                        <div className="flex flex-row justify-between mb-4">
                          <h1 className="bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-xl tracking-tight text-transparent">
                            POAP
                          </h1>
                          <span className="text-sm font-semibold leading-7 text-white">
                            {">"} 1
                          </span>
                        </div>
                        <div className="flex flex-row justify-between">
                          <label className="text-sm font-semibold leading-7 text-white">
                            Timestamp
                          </label>
                          <span className="ml-8 text-sm font-semibold leading-7 text-white">
                            {new Date().toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Search (move from Header) if no selected attestation */}
                  {attestationNote == "" && (
                    <Search />
                  )}

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-[-50vw] -bottom-48 -top-32 [mask-image:linear-gradient(transparent,white,white)] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:-bottom-32 lg:-top-32 lg:left-[calc(50%+14rem)] lg:right-0 lg:[mask-image:none] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
        <FoldingBg />
      </div>
    </>
  );
}
