import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";

import "./reactCOIServiceWorker";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Favicon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />

        {/* Meta */}
        <meta name="title" content="ZAP" />
        <meta
          name="description"
          content="The first Zero-Knowledge Attestation Protocol leveraging zk-SNARKs on Mina Protocol"
        />
        <meta name="theme-color" content="#ff007a" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* SEO */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mina-zap.vercel.app/" />
        <meta property="og:title" content="ZAP" />
        <meta
          property="og:description"
          content="The first Zero-Knowledge Attestation Protocol leveraging zk-SNARKs on Mina Protocol"
        />
        <meta
          property="og:image"
          content="/favicon/android-chrome-512x512.png"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
