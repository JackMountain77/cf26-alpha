"use client";

import { useState } from "react";

type ProfileEditFormProps = {
  user: {
    id: string;
    name: string | null;
    profile?: {
      nickname: string | null;
      age: number | null;
      schoolName: string | null;
    } | null;
  };
};

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [name, setName] = useState(user.name ?? "");
  const [nickname, setNickname] = useState(user.profile?.nickname ?? "");
  const [age, setAge] = useState(user.profile?.age ?? "");
  const [schoolName, setSchoolName] = useState(user.profile?.schoolName ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, nickname, age, schoolName }),
    });

    setSaving(false);

    if (res.ok) {
      setMessage("정보가 성공적으로 수정되었습니다.");
    } else {
      setMessage("수정 중 오류가 발생했습니다.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">이름</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">별명</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">나이</label>
        <input
          type="number"
          className="mt-1 w-full rounded border px-3 py-2"
          value={age ?? ""}
          onChange={(e) => setAge(Number(e.target.value))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">학교</label>
        <input
          className="mt-1 w-full rounded border px-3 py-2"
          value={schoolName ?? ""}
          onChange={(e) => setSchoolName(e.target.value)}
        />
      </div>

      <button
        disabled={saving}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "저장 중..." : "저장하기"}
      </button>

      {message && <p className="text-sm mt-2">{message}</p>}
    </form>
  );
}
