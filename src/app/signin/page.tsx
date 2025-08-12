"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <button
        className="rounded-xl border px-4 py-2"
        onClick={() => signIn("google")}
      >
        Sign in with Google
      </button>
    </div>
  );
}
