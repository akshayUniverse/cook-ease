import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Header from "@/components/layout/Header";
import FooterNav from "@/components/layout/FooterNav";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen pb-20">
        <Component {...pageProps} />
      </main>
      <FooterNav />
    </>
  );
}
