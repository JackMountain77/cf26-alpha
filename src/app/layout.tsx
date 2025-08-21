import type { Metadata } from "next";
import "./globals.css";

import Providers from "./providers";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "CF26",
  description: "CF26 alpha",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  const session = await getServerSession(authOptions);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900 flex flex-col">
        {/* 초기 세션을 SessionProvider에 주입 */}
        <Providers session={session}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
