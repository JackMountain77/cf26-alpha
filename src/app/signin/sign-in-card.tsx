"use client";
import { signIn } from "next-auth/react";

export default function SignInCard() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <button
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="rounded-xl border px-4 py-2 hover:bg-gray-50 cursor-pointer"
      >
        Sign in with Google
      </button>
    </div>
  );
}
