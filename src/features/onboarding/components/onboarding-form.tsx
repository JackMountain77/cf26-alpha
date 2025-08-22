"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type AccountType = "STUDENT" | "TEACHER";
type Gender = "MALE" | "FEMALE" | "OTHER" | "UNSPECIFIED";
type SchoolLevel = "ELEMENTARY" | "MIDDLE" | "HIGH" | "UNIVERSITY" | "GENERAL";

export default function OnboardingForm() {
  const { data: session } = useSession();

  // core states
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<Gender>("UNSPECIFIED");

  // student-only
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | "">("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");

  // teacher-only
  const [affiliation, setAffiliation] = useState("");

  // etc
  const [agreePI, setAgreePI] = useState(false);       // ✅ 개인정보 필수 동의
  const [agreeMarketing, setAgreeMarketing] = useState(false); // (선택) 마케팅 수신 동의
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isStudent = accountType === "STUDENT";
  const hideSchoolFields = isStudent && schoolLevel === "GENERAL";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 👉 역할은 내부적으로 필요하므로 유지(UX상 필수표시는 안 해도 실제로는 필요)
    if (!accountType) return setError("학생 또는 강사를 선택해 주세요.");

    // 👉 사용자가 요청한 필수 항목: 이름/별명/나이/(학생이면) 구분
    if (!name.trim()) return setError("이름은 필수입니다.");
    if (!nickname.trim()) return setError("별명(공개이름)은 필수입니다.");
    if (age === "" || Number.isNaN(age) || Number(age) <= 0)
      return setError("나이는 1 이상의 숫자로 입력해 주세요.");

    if (isStudent && !schoolLevel)
      return setError("학생의 경우 '구분'을 선택해 주세요.");

    // ✅ 개인정보 동의 체크 필수
    if (!agreePI) return setError("개인정보 수집·이용에 동의해 주세요.");

    setError(null);
    setSaving(true);

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
        schoolName: normalizedSchoolName,  // 옵션
        grade: normalizedGrade,            // 옵션
        affiliation: accountType === "TEACHER" ? affiliation || null : null, // 옵션
        // 선택 동의값은 필요 시 함께 전송
        marketingOptIn: agreeMarketing,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("저장 중 오류가 발생했습니다. 다시 시도해 주세요.");
      return;
    }

    window.location.replace("/dashboard");
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="w-full rounded-2xl border p-6 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-black-700">
            코딩프렌즈에 오신 것을 환영합니다
          </h1>
          <p className="text-base text-blue-700 font-medium">
            [ {session?.user?.email} ]
          </p>
        </div>

        <hr className="border-t border-gray-500 mt-2 mb-2" />
        <div className="mb-2 text-left text-black-600 text-sm leading-relaxed space-y-1 [&>p]:mb-0">
          <p>몇 가지 추가 정보를 작성해 주시면 회원가입이 완료됩니다.</p>
          <p>강사는 학생과 동일하게 서비스를 이용할 수 있으며, 화면 공유 등 강사 전용 기능을 이용할 수 있습니다.</p>
        </div>
        <hr className="border-t border-gray-500 mt-0 mb-4" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 역할 (내부적으로는 필수) */}
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
                  required
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

          {/* 이름 / 별명 (필수) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">
                이름<span className="ml-1 text-red-600">*</span>
              </label>
              <input
                className="rounded-lg border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                required
                aria-required
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">
                별명(공개이름)<span className="ml-1 text-red-600">*</span>
              </label>
              <input
                className="rounded-lg border px-3 py-2"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Easton"
                required
                aria-required
              />
            </div>
          </div>

          {/* 나이 / 성별 (나이 필수, 성별 옵션) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">
                나이<span className="ml-1 text-red-600">*</span>
              </label>
              <input
                type="number"
                min={1}
                className="rounded-lg border px-3 py-2"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="예: 16"
                required
                aria-required
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">성별 (선택)</label>
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

          {/* 학생 전용: 구분(필수) + 학교/학년(옵션) */}
          {isStudent && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">
                  구분<span className="ml-1 text-red-600">*</span>
                </label>
                <select
                  className="rounded-lg border px-3 py-2"
                  value={schoolLevel}
                  onChange={(e) => setSchoolLevel(e.target.value as SchoolLevel)}
                  required
                  aria-required
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
                  <div className="grid gap-1.5">
                    <label className="text-sm font-medium">학교 (선택)</label>
                    <input
                      className="rounded-lg border px-3 py-2 w-70"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="OO중학교"
                    />
                  </div>
                  <div className="ml-22 grid gap-1.5 md:pl-0">
                    <label className="text-sm font-medium">학년 (선택)</label>
                    <input
                      className="rounded-lg border px-3 py-2 w-24"
                      value={grade}
                      maxLength={5}
                      onChange={(e) => setGrade(e.target.value)}
                      placeholder="예: 1학년"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* 강사 전용: 소속 (옵션) */}
          {accountType === "TEACHER" && (
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">소속 (선택)</label>
              <input
                className="rounded-lg border px-3 py-2"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="예: CODING Friends"
              />
            </div>
          )}

          {/* ✅ 개인정보 수집·이용 동의 (필수) */}
          <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
            <div className="text-sm text-gray-700">
              <div className="font-semibold">개인정보 수집·이용 동의 <span className="text-red-600">*</span></div>
              <ul className="mt-1 list-disc pl-5 space-y-0.5">
                <li>수집 항목: 이름, 별명(공개이름), 나이, (학생의 경우) 구분 및 선택 입력 항목</li>
                <li>수집 목적: 회원관리 및 학습 서비스 제공</li>
                <li>보관 기간: 회원 탈퇴 시까지</li>
              </ul>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreePI}
                onChange={(e) => setAgreePI(e.target.checked)}
                required
                aria-required
              />
              <span>위 내용을 확인하였으며, 개인정보 수집·이용에 동의합니다.</span>
            </label>

            {/* 선택: 마케팅 수신 동의 */}
            <label className="flex items-start gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={agreeMarketing}
                onChange={(e) => setAgreeMarketing(e.target.checked)}
              />
              <span>(선택) 이벤트/소식 등 마케팅 정보 수신에 동의합니다.</span>
            </label>
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <div className="pt-2 text-center">
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
