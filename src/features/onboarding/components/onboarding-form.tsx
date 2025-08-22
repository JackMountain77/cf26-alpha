"use client";

import { useState } from "react";

type AccountType = "STUDENT" | "TEACHER";
type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
type SchoolLevel = "ELEMENTARY" | "MIDDLE" | "HIGH" | "UNIVERSITY" | "GENERAL";

export default function OnboardingForm() {
  // core states
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender>("UNSPECIFIED");

  // student-only states
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | "">("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");

  // teacher-only state
  const [affiliation, setAffiliation] = useState("");

  // misc states
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // derived flags
  const isStudent = accountType === "STUDENT";
  const hideSchoolFields = isStudent && schoolLevel === "GENERAL"; // hide 학교/학년 when GENERAL

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!accountType) return setError("학생 또는 강사를 선택해 주세요.");
    if (!name.trim() || !nickname.trim())
      return setError("이름과 공개이름(별명)을 입력해 주세요.");

    // For students, require school level (UX suggestion)
    if (isStudent && !schoolLevel) {
      return setError("학생의 경우 학교급을 선택해 주세요.");
    }

    setError(null);
    setSaving(true);

    // Normalize student-only payload: hide fields when GENERAL
    const normalizedSchoolName =
      isStudent && !hideSchoolFields ? schoolName || null : null;
    const normalizedGrade =
      isStudent && !hideSchoolFields ? grade || null : null;

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountType,
        name: name.trim(),
        nickname: nickname.trim(),
        age: age === "" ? null : Number(age),
        gender,
        schoolLevel: isStudent ? (schoolLevel || null) : null,
        schoolName: normalizedSchoolName,
        grade: normalizedGrade,
        affiliation: accountType === "TEACHER" ? affiliation || null : null,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    // done → dashboard
    window.location.replace("/dashboard");
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="w-full rounded-2xl border p-6 shadow-sm space-y-6">
        <h1 className="text-2xl font-bold text-blue-700">가입을 환영합니다!</h1>
        <p className="text-base text-gray-700 font-medium">
          {session?.user?.email} {/* next-auth 세션에서 이메일 표시 */}
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          추가정보를 작성해 주세요.<br />
          강사는 학생과 동일하게 서비스를 이용할 수 있으며<br />
          화면공유 등 강사 서비스를 사용하실 수 있습니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* role */}
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

          {/* name / nickname */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          {/* age / gender */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

          {/* student-only */}
          {isStudent && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* level select */}
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

              {/* show 학교/학년 only when not GENERAL */}
              {!hideSchoolFields && (
                <>
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">학교</label>
                    <input
                      className="rounded-lg border px-3 py-2"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="OO중학교"
                    />
                  </div>
                  <div className="grid gap-1.5 pl-12">
                    <label className="text-sm font-medium">학년</label>
                    <input
                      className="rounded-lg border px-3 py-2 w-30" // approx 3 chars width
                      value={grade}
                      maxLength={3}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="예: 1학년"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* teacher-only */}
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

          {error && (
            <p className="text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="pt-2">
            <button
              disabled={saving}
              className="rounded-lg border bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {saving ? "저장 중..." : "저장하고 시작하기"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
