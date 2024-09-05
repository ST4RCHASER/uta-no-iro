import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "@uta/utils/api";

import "@uta/styles/globals.css";
import { Toaster } from "@uta/shadcn/components/ui/toaster";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={GeistSans.className}>
      <Toaster />
      <Component {...pageProps} />
    </div>
  );
};

export default api.withTRPC(MyApp);
