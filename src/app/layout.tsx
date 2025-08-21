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
        <Providers session={session}>
          <SiteHeader />
          {/* 전역 컨테이너: 가운데 정렬 + 좌우 패딩 + 상하 여백 */}
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-20">
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
