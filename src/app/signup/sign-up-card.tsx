"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignUpCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^~])[A-Za-z\d@$!%*#?&^~]{8,}$/;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    const normEmail = email.trim().toLowerCase();

    // 1) 클라이언트 유효성 검사
    if (!emailRegex.test(normEmail)) {
      setError("올바른 이메일 주소를 입력해 주세요.");
      return;
    }
    if (!passwordRegex.test(password)) {
      setError("비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.");
      return;
    }
    if (password !== password2) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 2) 가입 생성
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normEmail, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({} as any));
        if (data?.error === "EMAIL_EXISTS") {
          setError("이미 가입된 이메일입니다. 로그인해 주세요.");
        } else if (data?.error === "EMAIL_EXISTS_OAUTH_ONLY") {
          setError("해당 이메일은 Google로 가입되어 있습니다. Google로 로그인해 주세요.");
        } else if (data?.error === "INVALID_EMAIL") {
          setError("올바른 이메일 형식이 아닙니다.");
        } else if (data?.error === "INVALID_PASSWORD") {
          setError("비밀번호 형식이 올바르지 않습니다.");
        } else {
          setError("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
        }
        setLoading(false);
        return;
      }

      // 3) 자동 로그인 + 서버 리다이렉트(쿠키 확정 후 이동 → 레이스 방지)
      await signIn("credentials", {
        email: normEmail,
        password,
        callbackUrl: "/onboarding",
        redirect: true, // 기본 true이지만 명시
      });

      // NOTE: redirect:true 이므로 여기 아래 코드는 실행되지 않습니다.
    } catch (err) {
      console.error(err);
      setError("알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <div className="w-full rounded-2xl border p-6 shadow-sm">
        <h1 className="text-xl font-semibold">회원가입</h1>
        <p className="mt-1 text-sm text-gray-500">계정을 만드는 방법을 선택해 주세요.</p>

        {/* Google 회원가입 → Onboarding으로 */}
        <button
          aria-label="Sign up with Google"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="mt-6 w-full rounded-lg border px-4 py-2
                     bg-white text-gray-800
                     hover:bg-blue-600 hover:text-white hover:border-blue-600
                     active:bg-blue-700
                     transition-colors cursor-pointer flex items-center justify-center gap-2"
          disabled={loading}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.706 32.657 29.24 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.937 6.054 29.24 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c10.494 0 19-8.506 19-19 0-1.341-.138-2.651-.389-3.917z"/>
            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.35 16.108 18.825 12 24 12c3.059 0 5.842 1.153 7.961 3.039l5.657-5.657C33.937 6.054 29.24 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
            <path fill="#4CAF50" d="M24 44c5.187 0 9.93-1.981 13.477-5.217l-6.218-5.264C29.2 35.065 26.77 36 24 36c-5.219 0-9.698-3.356-11.309-8.019l-6.54 5.035C9.466 39.62 16.18 44 24 44z"/>
            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.015 3.157-3.279 5.8-6.026 7.519l6.218 5.264C37.148 38.93 40 32.5 40 25c0-1.341-.138-2.651-.389-3.917z"/>
          </svg>
          구글 계정으로 회원가입
        </button>

        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          또는
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* 이메일 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none
                         focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none
                         focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="최소 8자 (영문, 숫자, 특수문자 포함)"
              disabled={loading}
            />
          </div>

          <div className="grid gap-1.5">
            <label htmlFor="password2" className="text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="password2"
              name="password2"
              type="password"
              autoComplete="new-password"
              required
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 outline-none
                         focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
              placeholder="비밀번호를 다시 입력"
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border px-4 py-2
                       bg-blue-600 text-white hover:bg-blue-700
                       transition-colors disabled:opacity-70"
          >
            {loading ? "가입 중..." : "이메일로 회원가입"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          이미 계정이 있으신가요?{" "}
          <a href="/signin" className="text-blue-600 hover:text-blue-700 underline">
            로그인
          </a>
        </div>
      </div>
    </section>
  );
}
