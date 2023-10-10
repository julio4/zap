import React, { useState, useRef } from "react"
import { Magnify } from "./logo";
import { useRouter } from 'next/router';

const Search = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!search || search == "") return;

    router.push('/verify');
    console.log("TODO: Search for attestation with note: ", search);
    setSearch("");
    setIsOpen(false);
  }

  const setFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    setIsOpen(true);
  }

  return (
    <button 
      onClick={() => setFocus()}
      onSubmit={handleSubmit}
      onKeyUp={(e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          setSearch("");
        } else if (e.key === "Enter") {
          handleSubmit(e);
        }
      }}
      className="group flex h-6 w-6 items-center justify-center sm:justify-start md:h-auto md:w-80 md:flex-none md:rounded-lg md:py-2.5 md:pl-4 md:pr-3.5 md:text-sm md:ring-1 md:ring-slate-200 md:hover:ring-slate-300 dark:md:bg-slate-800/75 dark:md:ring-inset dark:md:ring-white/5 dark:md:hover:bg-slate-700/40 dark:md:hover:ring-slate-500 lg:w-96">
      {/* Search Icon */}
      <div onClick={handleSubmit}>
        <Magnify />
      </div>

      <input
        ref={inputRef}
        hidden={!isOpen}
        type="text"
        className="flex-auto ml-2.5 text-slate-100 placeholder-slate-400 bg-transparent focus:outline-none focus:ring-0"
        placeholder="Verify attestation..."
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => {
          setSearch("")
          setIsOpen(false)
        }}
      />
      <span
        hidden={isOpen}
        onClick={() => setIsOpen(true)}
        className="font-thin sr-only md:not-sr-only md:ml-2 md:text-slate-500 md:dark:text-slate-400">
        Verify attestation...
      </span>

      {/* TODO KEYBOARD SHORTCUT ? */}
      {/* <kbd className="ml-auto hidden font-medium text-slate-400 dark:text-slate-500 md:block">
        <kbd className="font-sans">⌘</kbd>
        <kbd className="font-sans">K</kbd>
      </kbd> */}
    </button>
  )
}

export {
  Search
}