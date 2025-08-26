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
              className="px-3 h-9 flex items-center justify-center rounded-lg
                         border border-black text-black
                         hover:bg-black hover:text-white
                         transition-colors cursor-pointer"
            >
              마이 페이지
            </Link>
          )}

          {/* 로그인/회원가입/로그아웃 토글 */}
          {isAuthed ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 h-9 flex items-center justify-center rounded-lg
                         border border-red-500 text-red-600
                         hover:bg-red-600 hover:text-white
                         transition-colors cursor-pointer"
            >
              로그아웃
            </button>
          ) : (
            <>
              <Link
                href="/signin"
                className="px-3 h-9 flex items-center justify-center rounded-lg
                           border border-black text-black
                           hover:bg-black hover:text-white
                           transition-colors cursor-pointer"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="px-3 h-9 flex items-center justify-center rounded-lg
                           border border-black text-black
                           hover:bg-black hover:text-white
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
