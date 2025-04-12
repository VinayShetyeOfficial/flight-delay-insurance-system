import { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import "@/styles/globals.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <SettingsProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}

export default MyApp;
