"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";

export default function SignInCard() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      setLoading(false);
    } else {
      window.location.href = callbackUrl; // 로그인 성공 시 이동
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">로그인</h1>
        <p className="mt-1 text-sm text-gray-500">로그인 방법을 선택해 주세요.</p>

        {/* Google 로그인 */}
        <button
          aria-label="Sign in with Google"
          onClick={() => signIn("google", { callbackUrl })}
          className="mt-6 w-full rounded-lg border px-4 py-2
                     bg-white text-gray-800
                     hover:bg-blue-600 hover:text-white hover:border-blue-600
                     active:bg-blue-700
                     transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.706 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.937 6.054 29.24 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c10.494 0 19-8.506 19-19 0-1.341-.138-2.651-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.35 16.108 18.825 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.937 6.054 29.24 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.187 0 9.93-1.981 13.477-5.217l-6.218-5.264C29.2 35.065 26.77 36 24 36c-5.219 0-9.698-3.356-11.309-8.019l-6.54 5.035C9.466 39.62 16.18 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.015 3.157-3.279 5.8-6.026 7.519l6.218 5.264C37.148 38.93 40 32.5 40 25c0-1.341-.138-2.651-.389-3.917z"/>
          </svg>
          구글 계정으로 로그인
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          또는
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* 이메일/비밀번호 로그인 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none
                         focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none
                         focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border px-4 py-2
                       bg-gray-600 text-white hover:bg-black
                       transition-colors disabled:opacity-70 cursor-pointer"
          >
            {loading ? "로그인 중..." : "이메일로 로그인"}
          </button>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <div className="mt-4 text-sm text-gray-600">
          계정이 없으신가요?{" "}
          <a href="/signup" className="text-blue-600 hover:text-blue-700 underline">
            회원가입
          </a>
        </div>
      </div>
    </main>
  );
}
