import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { initializeExchangeRate, getSelectedCurrency } from "@/utils/priceConverter";

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  // Initialize exchange rate on app load for selected currency
  useEffect(() => {
    const currency = getSelectedCurrency();
    initializeExchangeRate(currency).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn("[App] Failed to initialize exchange rate:", error.message);
      }
    });
  }, []);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster position="top-center" />
    </SessionProvider>
  );
}
