import React, { useState, useRef } from "react"
import { Magnify } from "./logo";
import { useRouter } from 'next/router';

const Search = () => {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!search || search === "") return;
  
    // TODO: validate search
    router.push('/verify?note=' + search);
  }

  const handleDivClick = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const setFocus = () => {
    setIsOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  return (
    <div
      onClick={() => setFocus()}
      className="bg-slate-900/70 z-50 transition duration-500 ease-in-out hover:cursor-pointer transform hover:scale-105"
      style={{
        transform: isOpen ? "scale(1.05)" : "scale(1)",
      }}
    >
      <form
        ref={formRef} onSubmit={handleSubmit}
        onKeyUp={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
            setSearch("");
          }
        }}
        className="group flex h-6 w-6 items-center justify-center sm:justify-start md:h-auto md:w-80 md:flex-none md:rounded-lg md:py-2.5 md:pl-4 md:pr-3.5 md:text-sm md:ring-1 md:ring-slate-200 md:hover:ring-slate-300 dark:md:bg-slate-800/75 dark:md:ring-inset dark:md:ring-white/5 dark:md:hover:bg-slate-700/40 dark:md:hover:ring-slate-500 lg:w-96 z-50">
        {/* Search Icon */}
        <div onClick={handleDivClick}>
          <Magnify />
        </div>

        <div>
          <input
            ref={inputRef}
            type="text"
            maxLength={1000}
            style={{opacity: isOpen ? 1 : 0, width: isOpen ? "100%" : "0"}}
            className="font-thin cursor-pointer flex-auto ml-2.5 text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none focus:ring-0"
            placeholder="Verify attestation..."
            value={isOpen ? search : ""}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => {
              setSearch("")
              setIsOpen(false)
            }}
          />
          <span
            hidden={isOpen}
            onClick={() => setIsOpen(true)}
            className="font-thin sr-only md:not-sr-only md:text-slate-500 md:dark:text-slate-400">
            Verify attestation...
          </span>
        </div>

        {/* TODO KEYBOARD SHORTCUT ? */}
        {/* <kbd className="ml-auto hidden font-medium text-slate-400 dark:text-slate-500 md:block">
          <kbd className="font-sans">⌘</kbd>
          <kbd className="font-sans">K</kbd>
        </kbd> */}
      </form>
    </div>
  )
}

export {
  Search
}