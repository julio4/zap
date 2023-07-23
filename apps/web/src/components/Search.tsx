import React, { useState, useRef } from "react"

const Search = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!search || search == "") return;

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
      <svg onClick={handleSubmit}
        aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 flex-none fill-slate-400 group-hover:fill-slate-500 dark:fill-slate-500 md:group-hover:fill-slate-400"><path d="M16.293 17.707a1 1 0 0 0 1.414-1.414l-1.414 1.414ZM9 14a5 5 0 0 1-5-5H2a7 7 0 0 0 7 7v-2ZM4 9a5 5 0 0 1 5-5V2a7 7 0 0 0-7 7h2Zm5-5a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7v2Zm8.707 12.293-3.757-3.757-1.414 1.414 3.757 3.757 1.414-1.414ZM14 9a4.98 4.98 0 0 1-1.464 3.536l1.414 1.414A6.98 6.98 0 0 0 16 9h-2Zm-1.464 3.536A4.98 4.98 0 0 1 9 14v2a6.98 6.98 0 0 0 4.95-2.05l-1.414-1.414Z"></path></svg>

      <input
        ref={inputRef}
        hidden={!isOpen}
        type="text"
        className="flex-auto ml-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 bg-transparent focus:outline-none focus:ring-0"
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