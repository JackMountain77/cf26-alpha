// app/onboarding/ui/onboarding-form.tsx
"use client";

import { useState } from "react";

type AccountType = "STUDENT" | "TEACHER";
type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
type SchoolLevel = "ELEMENTARY" | "MIDDLE" | "HIGH" | "UNIVERSITY" | "GENERAL";

export default function OnboardingForm() {
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender>("UNSPECIFIED");

  // 학생 전용
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | "">("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");

  // 강사 전용
  const [affiliation, setAffiliation] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!accountType) return setError("학생 또는 강사를 선택해 주세요.");
    if (!name.trim() || !nickname.trim()) return setError("이름과 공개이름(별명)을 입력해 주세요.");

    // 학생 선택 시 최소 학교급은 받는 편이 UX에 좋습니다(선택).
    if (accountType === "STUDENT" && !schoolLevel) {
      return setError("학생의 경우 학교급을 선택해 주세요.");
    }

    setError(null);
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountType,
        name: name.trim(),
        nickname: nickname.trim(),
        age: age === "" ? null : Number(age),
        gender,
        schoolLevel: accountType === "STUDENT" ? schoolLevel || null : null,
        schoolName: accountType === "STUDENT" ? schoolName || null : null,
        grade: accountType === "STUDENT" ? grade || null : null,
        affiliation: accountType === "TEACHER" ? affiliation || null : null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    // 완료 → 대시보드
    window.location.replace("/dashboard");
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="w-full rounded-2xl border p-6 shadow-sm space-y-6">
        <h1 className="text-xl font-semibold">추가 정보 입력</h1>
        <p className="text-sm text-gray-500">가입을 환영합니다! 다음 정보를 작성해 주세요.</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 역할 */}
          <div className="grid gap-1.5">
            <label className="text-sm font-medium">역할</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={accountType === "STUDENT"}
                  onChange={() => setAccountType("STUDENT")}
                />
                학생
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="role"
                  value="TEACHER"
                  checked={accountType === "TEACHER"}
                  onChange={() => setAccountType("TEACHER")}
                />
                강사
              </label>
            </div>
          </div>

          {/* 이름/별명 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">이름</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">별명(공개이름)</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Easton"
              />
            </div>
          </div>

          {/* 나이/성별 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">나이</label>
              <input
                type="number"
                min={1}
                className="rounded-lg border px-3 py-2"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="예: 16"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">성별</label>
              <select
                className="rounded-lg border px-3 py-2"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
              >
                <option value="UNSPECIFIED">선택 안 함</option>
                <option value="MALE">남</option>
                <option value="FEMALE">여</option>
              </select>
            </div>
          </div>

          {/* 학생 전용 입력 */}
          {accountType === "STUDENT" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">구분</label>
                <select
                  className="rounded-lg border px-3 py-2"
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
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">학교</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="OO중학교"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">학년</label>
                <input
                  className="rounded-lg border px-3 py-2"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="예: 1학년"
                />
              </div>
            </div>
          )}

          {/* 강사 전용 입력 */}
          {accountType === "TEACHER" && (
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">소속</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="예: CODING Friends"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <div className="pt-2">
            <button
              disabled={saving}
              className="rounded-lg border px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? "저장 중..." : "저장하고 시작하기"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
