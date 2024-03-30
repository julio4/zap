"use client";
import { useState } from "react";
import Link from 'next/link';


export default function Home() {
  const [source, setSource] = useState({
    publicKey: "",
    urlApi: "",
    name: "",
    description: "",
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setSource((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("NOT IMPLEMENTED ONCHAIN, ONLY MOCK. Submitting source:", source)
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 space-y-4 rounded shadow-md bg-white"
      >
        <div>
          <label htmlFor="publicKey" className="block text-sm font-medium text-gray-700">
            Public Key
          </label>
          <input
            type="text"
            name="publicKey"
            id="publicKey"
            required
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-2 border-gray-700 shadow-sm  sm:text-sm text-gray-700"
          />
        </div>
        <div>
          <label htmlFor="urlApi" className="block text-sm font-medium text-gray-700">
            URL API
          </label>
          <input
            type="text"
            name="urlApi"
            id="urlApi"
            required
            onChange={handleChange}
            className="mt-1 block w-full p-1 rounded-md shadow-sm border-2 border-gray-700 sm:text-sm text-gray-700"
          />
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            onChange={handleChange}
            className="mt-1 block w-full p-1 rounded-md shadow-sm border-2 border-gray-700 sm:text-sm text-gray-700"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            id="description"
            required
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full p-1 rounded-md shadow-sm border-2 border-gray-700 sm:text-sm text-gray-700"
          ></textarea>
        </div>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Register Source
        </button>
      </form>
      <div className="my-4">
        <Link href="/" passHref>
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
