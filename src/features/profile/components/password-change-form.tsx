"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 비밀번호 정책: 영문, 숫자, 특수문자 포함 8자리 이상
  const passwordPolicy =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!passwordPolicy.test(newPassword)) {
      return setError("비밀번호는 영문, 숫자, 특수문자를 포함해 8자리 이상이어야 합니다.");
    }
    if (newPassword !== confirmPassword) {
      return setError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
    }
    if (newPassword === currentPassword) {
      return setError("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
    }

    setError(null);
    setSaving(true);

    const res = await fetch("/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    setSaving(false);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return setError(data.error || "비밀번호 변경 중 오류가 발생했습니다.");
    } 

    // 성공 처리 (알림 또는 페이지 이동)
    
    // toast.success("비밀번호 변경 완료 🎉", {
    //     description: "성공적으로 변경되었습니다.",
    //   });
    alert(data.message || "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.");
    await signOut({ callbackUrl: "/signin" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 현재 비밀번호 */}
      <div>
        <label className="text-sm font-medium">현재 비밀번호</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>

      {/* 새 비밀번호 */}
      <div>
        <label className="text-sm font-medium">새 비밀번호</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <p className="mt-1 text-xs text-gray-500">
          영문, 숫자, 특수문자를 포함한 8자리 이상
        </p>
      </div>

      {/* 새 비밀번호 확인 */}
      <div>
        <label className="text-sm font-medium">새 비밀번호 확인</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border bg-blue-600 px-4 py-2 text-white 
                     hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
        >
          {saving ? "변경 중..." : "비밀번호 변경"}
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/dashboard")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 
                     hover:bg-gray-200 cursor-pointer"
        >
          취소
        </button>
      </div>
    </form>
  );
}
