"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function SiteHeader() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          CODING Friends
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/dashboard">Dashboard</Link>

          {status === "authenticated" ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
