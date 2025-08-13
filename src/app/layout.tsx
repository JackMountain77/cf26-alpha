import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CF26",
  description: "CF26 alpha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900 flex flex-col">
        {/* Header */}
        <header className="border-b">
          <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-xl tracking-tight">
              CODING Friends
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              {/* 필요 시 메뉴 추가 */}
              <Link href="/signin" className="rounded-md border px-3 py-1.5 hover:bg-gray-50">
                Login
              </Link>
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
            {/* 비워둠: 필요 시 회사 정보/저작권 추가 */}
          </div>
        </footer>
      </body>
    </html>
  );
}
