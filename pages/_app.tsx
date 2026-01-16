// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/global.css"; // imports your global CSS

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
