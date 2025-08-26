"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role, SchoolLevel } from "@prisma/client";

// type AccountType = "Student" | "Instructor"; // Prisma Role enum과 일치
// type SchoolLevel = "ELEMENTARY" | "MIDDLE" | "HIGH" | "UNIVERSITY" | "GENERAL";

type ProfileEditFormProps = {
  user: {
    id: string;
    name: string | null;
    role: Role;   // ✅ Prisma Role enum 그대로 사용
    profile?: {
      nickname: string | null;
      age: number | null;
      schoolLevel: SchoolLevel | null;
      schoolName: string | null;
      grade: string | null;
      affiliation: string | null;
    } | null;
  };
};


export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();

  // 공통
  const [name, setName] = useState(user.name ?? "");
  const [nickname, setNickname] = useState(user.profile?.nickname ?? "");
  const [age, setAge] = useState<number | "">(user.profile?.age ?? "");

  // 학생 전용
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | "">(user.profile?.schoolLevel ?? "");
  const [schoolName, setSchoolName] = useState(user.profile?.schoolName ?? "");
  const [grade, setGrade] = useState(user.profile?.grade ?? "");

  // 강사 전용
  const [affiliation, setAffiliation] = useState(user.profile?.affiliation ?? "");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Prisma Role 값 그대로 사용
  const isStudent = user.role === "Student";
  const isInstructor = user.role === "Instructor";

  const hideSchoolFields = isStudent && schoolLevel === "GENERAL";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) return setError("이름은 필수입니다.");
    if (!nickname.trim()) return setError("별명은 필수입니다.");
    if (age === "" || Number.isNaN(age) || Number(age) <= 0)
      return setError("나이는 1 이상의 숫자여야 합니다.");

    setError(null);
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        nickname,
        age: typeof age === "string" && age === "" ? null : Number(age), 
        schoolLevel: isStudent ? schoolLevel || null : null,
        schoolName: isStudent && !hideSchoolFields ? schoolName : null,
        grade: isStudent && !hideSchoolFields ? grade : null,
        affiliation: isInstructor ? affiliation : null,
      }),
    });

    setSaving(false);
    if (!res.ok) {
      setError("저장 중 오류가 발생했습니다.");
      return;
    }
    router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 이름 / 별명 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">이름 *</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">별명 *</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
      </div>

      {/* 나이 */}
      <div>
        <label className="text-sm font-medium">나이 *</label>
        <input
          type="number"
          className="mt-1 w-full rounded-lg border px-3 py-2"
          value={age}
          onChange={(e) => {
            const val = e.target.value;
            setAge(val === "" ? "" : Number(val)); // 👈 빈 값 허용
          }}
        />
      </div>

      {/* 학생 전용 */}
      {isStudent && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">구분 *</label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={schoolLevel}
              onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
            >
              <option value="">선택</option>
              <option value="ELEMENTARY">초</option>
              <option value="MIDDLE">중</option>
              <option value="HIGH">고</option>
              <option value="UNIVERSITY">대학</option>
              <option value="GENERAL">일반</option>
            </select>
          </div>
          {!hideSchoolFields && (
            <>
              <div>
                <label className="text-sm font-medium">학교</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">학년</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* 강사 전용 */}
      {isInstructor && (
        <div>
          <label className="text-sm font-medium">소속</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={affiliation}
            onChange={(e) => setAffiliation(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* 버튼 영역 */}
      <div className="flex justify-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
        >
          {saving ? "저장 중..." : "저장하기"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-200 cursor-pointer"
        >
          취소
        </button>
      </div>
    </form>
  );
}
