"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function SiteHeader() {
  const { data: session } = useSession();
  const isAuthed = !!session?.user;

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          CODING Friends
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {/* 로그인 후에만 Dashboard 노출 */}
          {isAuthed && (
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
          )}

          {/* 로그인/회원가입/로그아웃 토글 */}
          {isAuthed ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="inline-flex items-center justify-center h-9 px-3 rounded-lg
                         border border-red-200 bg-red-100 text-red-700
                         hover:bg-red-600 hover:text-white hover:border-red-600
                         active:bg-red-700
                         focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-300
                         transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          ) : (
            <>
              <Link
                href="/signin"
                className="inline-flex items-center justify-center h-9 px-3 rounded-lg
                           border border-blue-200 bg-blue-100 text-blue-700
                           hover:bg-blue-600 hover:text-white hover:border-blue-600
                           active:bg-blue-700
                           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-300
                           transition-colors cursor-pointer"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-9 px-3 rounded-lg
                           border border-green-200 bg-green-100 text-green-700
                           hover:bg-green-600 hover:text-white hover:border-green-600
                           active:bg-green-700
                           focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-300
                           transition-colors cursor-pointer"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
