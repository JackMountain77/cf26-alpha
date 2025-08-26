"use client";

import { useState } from "react";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);

    if (res.ok) {
      setMessage("비밀번호가 변경되었습니다.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setMessage("비밀번호 변경 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">현재 비밀번호</label>
        <input
          type="password"
          className="mt-1 w-full rounded border px-3 py-2"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">새 비밀번호</label>
        <input
          type="password"
          className="mt-1 w-full rounded border px-3 py-2"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">새 비밀번호 확인</label>
        <input
          type="password"
          className="mt-1 w-full rounded border px-3 py-2"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>

      <button
        disabled={saving}
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {saving ? "변경 중..." : "비밀번호 변경"}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
