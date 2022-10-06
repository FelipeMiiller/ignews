import "../styles/global.scss";
import type { AppProps } from "next/app";
import { Header as HeaderPages } from "../conponents/Header";
import { SessionProvider as ProviderNexAuth, useSession } from "next-auth/react";





function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
    <ProviderNexAuth session={pageProps.session}>
      <HeaderPages />
      <Component {...pageProps} />
      </ProviderNexAuth>
    </>
  );
}

export default MyApp;

