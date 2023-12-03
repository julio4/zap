import React from "react";

import { Header } from "../components/Header";
import { LeftDetails } from "../components/home/LeftDetails";
import { RightDetails } from "../components/home/RightDetails";
import { FoldingBg } from "../components/logo";

export default function Home(): JSX.Element {
  return (
    <>
      <Header />
      <div className="overflow-hidden flex flex-col justify-center lg:h-screen bg-slate-900 dark:-mb-32 dark:mt-[-4.5rem] dark:pb-32 dark:pt-[4.5rem] dark:lg:mt-[-4.75rem] dark:lg:pt-[4.75rem]">
        <div className="py-16 sm:px-2 lg:relative lg:px-0 lg:py-20">
          <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-7xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
            <LeftDetails />
            <RightDetails />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-[-50vw] -bottom-48 -top-32 [mask-image:linear-gradient(transparent,white,white)] dark:[mask-image:linear-gradient(transparent,white,transparent)] lg:-bottom-32 lg:-top-32 lg:left-[calc(50%+14rem)] lg:right-0 lg:[mask-image:none] lg:dark:[mask-image:linear-gradient(white,white,transparent)]">
        <FoldingBg />
      </div>

    </>
  );
}
