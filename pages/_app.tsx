import "@/styles/globals.css";
import type { AppProps } from "next/app";
<<<<<<< HEAD
import MainLayout from "@/components/layout/MainLayout";
import { AuthProvider } from "@/hooks/useAuth";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </AuthProvider>
  );
=======

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
>>>>>>> f8559a1 (Initial commit from Create Next App)
}
