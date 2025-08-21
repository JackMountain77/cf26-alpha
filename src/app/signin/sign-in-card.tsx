"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignInCard() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-gray-500">
          Choose a method to sign in.
        </p>

        {/* Google 로그인 */}
        <button
          aria-label="Sign in with Google"
          onClick={() => signIn("google", { callbackUrl })}
          className="mt-6 w-full rounded-lg border px-4 py-2
                     hover:bg-gray-50 active:bg-gray-100
                     transition-colors cursor-pointer"
        >
          Continue with Google
        </button>

        {/* 구분선 */}
        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          OR
          <span className="h-px flex-1 bg-gray-2 00" />
        </div>

        {/* 앞으로 확장할 로그인/가입 자리 */}
        <button
          disabled
          className="w-full rounded-lg border px-4 py-2 text-gray-400
                     bg-gray-50 cursor-not-allowed"
          title="Coming soon"
        >
          Email / Password 
        </button>

        <div className="mt-4 text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <span className="text-gray-400" title="Coming soon">
            Sign up
          </span>
        </div>
      </div>
    </main>
  );
}
