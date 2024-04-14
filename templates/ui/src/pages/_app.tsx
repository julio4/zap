import "@/styles/globals.css";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Component {...pageProps} />
    </QueryClientProvider>
  );
}
