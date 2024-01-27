import Link from "next/link";
import { Search } from "./Search";
import { Github } from "./logo";

import { FaRegUserCircle } from "react-icons/fa";

const Header = ({
  MinaWalletComponent,
  EthereumWalletComponent,
  showSearch = true,
}: {
  MinaWalletComponent?: JSX.Element;
  EthereumWalletComponent?: JSX.Element;
  showSearch?: boolean;
}) => {
  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between px-4 py-5 transition duration-500 sm:px-6 lg:px-8 bg-transparent">
      {/* LOGO */}
      <div className="relative flex flex-grow basis-0 items-center">
        <Link href="/">
          {/* TODO Logo SVG? */}
          <h1 className="mx-auto text-center text-xl font-extrabold tracking-tight text-white sm:text-sm lg:text-2xl xl:text-2xl">
            <span className="block px-2">⚡ ZAP</span>
          </h1>
        </Link>
      </div>

      {/* SEARCH */}
      <div className="-my-5 mr-6 sm:mr-8 md:mr-0">
        {showSearch && <Search />}
      </div>

      <div className="relative flex basis-0 items-center justify-end gap-6 sm:gap-8 md:flex-grow">
        {/* WALLET */}
        {MinaWalletComponent}
        {EthereumWalletComponent}

        <Link href="/attestationHistory">
          <div className="group">
            <FaRegUserCircle className="h-7 w-7 fill-slate-400 group-hover:fill-slate-500 dark:group-hover:fill-slate-300" />
          </div>
        </Link>

        <Link
          href="https://github.com/julio4/zap"
          className="group"
          target="_blank"
          rel="noreferrer"
        >
          <Github />
        </Link>
      </div>
    </header>
  );
};

export { Header };
