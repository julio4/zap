import React, { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from 'next/router';
import { AttestContext } from "../components/context/attestContext";

import { Header } from "../components/Header";
import { FoldingBg } from "../components/logo";
import { Search } from "../components/Search";
import { decodeAttestationNote } from "../utils/createBase64Attestation";
import { AttestationNote } from "../types";
import { Zap } from "../../../../zap/build/Zap.js";
import { Mina, Provable, ProvablePure, PublicKey, UInt32 } from "o1js";
import { stringFromFields } from "o1js/dist/node/bindings/lib/encoding";

type HomeProps = {};
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
}



async function timeout(seconds: number): Promise<void> {  // todo: put in utils
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

export default function Home(props: HomeProps): JSX.Element {
  const attest = useContext(AttestContext);
  const router = useRouter();
  const [note, setNote] = useState<string | string[] | undefined>(undefined);
  const [resultVerification, setResultVerification] = useState<boolean | undefined>(undefined)

  const [workerSet, setWorkerSet] = useState(false);  // todo: use this to show loading spinner
  const [eventsFetched, setEventsFetched] = useState<MinaEvent[] | undefined>(undefined);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [attestationNote, setAttestationNote] = useState<AttestationNote | null>(null);

  let trigger = true;
  trigger = !trigger; // todo

  useEffect(() => {
    (async () => {
      if (!workerSet) {
        const MINAURL = "https://proxy.berkeley.minaexplorer.com/graphql";
        const ARCHIVEURL = "https://archive.berkeley.minaexplorer.com";
        const network = Mina.Network({
          mina: MINAURL,
          archive: ARCHIVEURL,
        });
        Mina.setActiveInstance(network);

        const publicKeySender = PublicKey.fromBase58("B62qm3bbCSy8ixuacL8FJzWdoj9MBjQGgrzHwiHtksBHTtmFWhidKxS")
        const zkapp = new Zap(PublicKey.fromBase58("B62qnhBxxQr7h2AE9f912AyvzJwK1fhEJq7NMZXbzXbhoepUZ7z7237"))
        const minaEvents: MinaEvent[] = await zkapp.fetchEvents(UInt32.from(0))
        setEventsFetched(minaEvents)
      }
    })();
  }, [trigger]);

  useEffect(() => {
    if (router.isReady) {
      const queryNote = router.query.note;
      if (queryNote) {
        console.log("Note found:", queryNote)
        setNote(queryNote);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (note) {
      try {
        // replace all spaces with + (url encoded)
        const decoded_note = decodeAttestationNote(note.toString().replace(/ /g, "+"));
        setAttestationNote(decoded_note);
      } catch (e) {
        // clear url parameter
        router.replace(router.pathname);
      }
    }
  }, [note]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setCursorPosition({ x, y });
  };

  const verifyAttestation = (events: MinaEvent[], hashAttestation: string) => {
    for (let event of events) {
      let valueArray: Provable<any> = event.event.data;
      
      const currentHash = (valueArray as any).value[1][1]
      if (BigInt(currentHash) === BigInt(hashAttestation)) {
        console.log("AttestationHash Found!")
        return true;
      }
    }
    console.log("Attestation not found. Be sure that your transaction has been validated")
    return false;
  };


  return (
    <>
      <Header showSearch={attestationNote != null} />
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
                <p className="font-light mt-3 text-md tracking-tight text-slate-400">
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
                  {attestationNote != null && (
                    <div
                      className="group max-w-full flex rounded-2xl transition-shadow hover:shadow-md bg-slate-800/75 hover:shadow-black/5 z-50"
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

                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 z-50"></div>
                      <div className="relative max-w-full rounded-2xl px-4 pb-4 pt-4 bg-gradient-to-r from-slate-700 to-slate-600 z-50">
                        <div className="flex flex-col justify-between mb-4 break-words">
                          <h1 className="bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-xl tracking-tight text-transparent">
                            Statement
                          </h1>
                          <span className="leading-7 text-gray-300">
                            {attestationNote.statement}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between mb-2 break-words">
                          <h1 className="bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent">
                            Attestation Hash
                          </h1>
                          <span className="text-sm leading-7 text-gray-400">
                            {attestationNote.attestationHash}
                          </span>
                        </div>
                        <div className="flex flex-col justify-between mb-2 break-words">
                          <h1 className="bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent">
                            Hash Route
                          </h1>
                          <span className="text-sm leading-7 text-gray-400">
                            {attestationNote.hashRoute}
                          </span>
                        </div>
                        <div className="flex justify-center mb-2 break-words">
                          <button
                            onClick={() => {
                              if (!eventsFetched){
                                console.log("No events fetched")
                                return
                              }
                              setResultVerification(verifyAttestation(eventsFetched, attestationNote.attestationHash))
                            }}
                            className="w-36 p-2 bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display tracking-tight text-transparent ring-1 rounded">
                            Verify Attestation
                          </button>
                        </div>
                        {
                          resultVerification === true && (
                            <div className="text-center text-green-500">
                              Verified
                            </div>
                          )
                        }
                        {
                          resultVerification === false && (
                            <div className="text-center text-red-500">
                              Not Verified
                            </div>
                          )
                        }

                      </div>
                    </div>
                  )}

                  {/* Search (move from Header) if no selected attestation */}
                  {attestationNote == null && (
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
