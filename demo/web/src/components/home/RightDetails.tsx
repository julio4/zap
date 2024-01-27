import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Magnify, People } from "../logo";

const RightDetails = () => {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setCursorPosition({ x, y });
  };

  return (
    <div className="relative lg:static xl:pl-10">
      <div className="relative">
        <Image
          src="/assets/blur-cyan.png"
          alt="Blur Cyan"
          width={530}
          height={530}
          decoding="async"
          fetchPriority="high"
          priority
          style={{ color: "transparent" }}
          className="absolute -right-64 -top-64"
        />
        <Image
          src="/assets/blur-indigo.png"
          alt="Blur Indigo"
          width={567}
          height={567}
          decoding="async"
          fetchPriority="high"
          priority
          style={{ color: "transparent" }}
          className="absolute -bottom-40 -right-44"
        />

        <div className="not-prose grid grid-cols-1 gap-8 sm:grid-cols-2">
          {/* Card */}
          <Link
            className="group relative flex rounded-2xl transition-shadow hover:shadow-md bg-slate-800/75 hover:shadow-black/5 z-50"
            href="/attest"
          >
            <div onMouseMove={handleMouseMove}>
              <div className="pointer-events-none">
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition duration-300 group-hover:opacity-100 to-[#161648] from-[#0c5553]"
                  style={{
                    maskImage: `radial-gradient(180px at ${cursorPosition.x}px ${cursorPosition.y}px, white, transparent)`,
                  }}
                ></div>
              </div>

              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20"></div>
              <div className="relative rounded-2xl px-4 pb-4 pt-16">
                <div className="flex h-7 w-7 items-center justify-center rounded-full ring-1 backdrop-blur-[2px] transition duration-300 bg-white/7.5 ring-white/15 group-hover:bg-sky-300/10 group-hover:ring-sky-400">
                  <People />
                </div>
                <h3 className="mt-4 text-sm font-semibold leading-7 text-white">
                  <span className="absolute inset-0 rounded-2xl"></span>
                  Create
                </h3>
                <p className="mt-1 font-light text-sm text-zinc-400">
                  Define your statement from a list of predefined data sources
                  and create your attestation.
                </p>
              </div>
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            className="group relative flex rounded-2xl transition-shadow hover:shadow-md bg-slate-800/75 hover:shadow-black/5 z-50"
            href="/verify"
          >
            <div onMouseMove={handleMouseMove}>
              <div className="pointer-events-none">
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition duration-300 group-hover:opacity-100 from-[#161648] to-[#0c5553]"
                  style={{
                    maskImage: `radial-gradient(180px at ${cursorPosition.x}px ${cursorPosition.y}px, white, transparent)`,
                  }}
                ></div>
              </div>

              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20"></div>
              <div className="relative rounded-2xl px-4 pb-4 pt-16">
                <div className="flex h-7 w-7 items-center justify-center rounded-full ring-1 backdrop-blur-[2px] transition duration-300 bg-white/7.5 ring-white/15 group-hover:bg-sky-300/10 group-hover:ring-sky-400">
                  <Magnify />
                </div>
                <h3 className="mt-4 text-sm font-semibold leading-7 text-white">
                  <span className="absolute inset-0 rounded-2xl"></span>
                  Verify
                </h3>
                <p className="mt-1 font-light text-sm text-zinc-400">
                  Verify a given attestation and explore the details of the
                  authentified statement.
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { RightDetails };
