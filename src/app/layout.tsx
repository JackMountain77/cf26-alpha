// src/app/layout.tsx
import type { Metadata } from "next";
import "@/styles/globals.css";

import Providers from "./providers";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CODING Friends",
  description: "교육기관, 강사, 학생 모두의 코딩교육을 위한 오픈 플랫폼 코딩프렌즈",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900 flex flex-col">
        {/* Global context providers (e.g., SessionProvider) */}
        <Providers>
          <SiteHeader />
          {/* Global container: centered, responsive paddings/margins */}
          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-20">
            {children}
            <Toaster richColors position="top-right" /> {/* ✅ 글로벌 토스트 */}
          </main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}


