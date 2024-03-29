import '../globals.css';
import GradientBG from "../components/GradientBG.js";
import type { AppProps } from 'next/app';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GradientBG>
      <Component {...pageProps} />
    </GradientBG>
  );
}