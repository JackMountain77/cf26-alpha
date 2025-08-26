// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Gender, Role, SchoolLevel } from "@prisma/client";

// 라벨 변환
const roleLabel: Record<Role, string> = {
  Admin: "관리자",
  Campus: "캠퍼스",
  Instructor: "강사",
  Student: "학생",
};

const genderLabel: Record<Gender, string> = {
  MALE: "남",
  FEMALE: "여",
  OTHER: "기타",
  UNSPECIFIED: "선택 안 함",
};

const schoolLevelLabel: Record<SchoolLevel, string> = {
  ELEMENTARY: "초등",
  MIDDLE: "중등",
  HIGH: "고등",
  UNIVERSITY: "대학",
  GENERAL: "일반",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      password: true,
      profileCompleted: true,
      marketingOptIn: true,
      profile: {
        select: {
          nickname: true,
          age: true,
          gender: true,
          schoolLevel: true,
          schoolName: true,
          grade: true,
          affiliation: true,
        },
      },
    },
  });

  if (!user?.profileCompleted) {
    redirect("/onboarding");
  }
  
  const profile = user.profile;

  const sNickname = profile.nickname;
  const sEmail = user.email;
  const sRole = roleLabel[user.role];

  const sUsername = user.name;
  const sAge = profile.age;
  const sGender = profile.gender;

  const isStudent = user.role === "Student";
  const isInstructor = user.role === "Instructor";

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Page</h1>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            user.profileCompleted
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          }`}
        >
          {user.profileCompleted ? "온보딩 완료" : "온보딩 미완료"}
        </span>
      </header>

      {/* 상단 통합 정보 박스 */}
      <section className="rounded-2xl border p-5 shadow-sm space-y-6">
      {/* 상단 프로필 헤더 */}
      <div className="flex items-center gap-6">
        {/* 왼쪽: 아바타 + 기본 정보 */}
        <div className="flex items-center gap-4 min-w-[200px]">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="avatar"
              className="h-16 w-16 rounded-full border"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full border bg-blue-200 text-lg text-gray-900">
              {sNickname.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium text-lg">{sNickname}</div>
            <div className="text-sm text-black-500">{sEmail}</div>
            <div className="mt-1 text-sm text-black-600 font-bold">
              {sRole}
            </div>
          </div>
        </div>

        {/* 오른쪽: 프로필 상세 */}
        {profile && (
          <div className="flex-1 space-y-2 text-sm">
            {/* 이름 */}
            {sUsername && (
              <div>
                이름 :{" "}
                <span className="font-bold">{sUsername}</span>
              </div>
            )}

            {/* 성별 + 나이 */}
            {(sGender || sAge) && (
              <div>
                성별 :{" "}
                <span className="font-bold">
                  {profile.gender ? genderLabel[profile.gender] : "-"}
                </span>{" "}
                / 나이 :{" "}
                <span className="font-bold">
                  {profile.age ?? "-"}
                </span>
              </div>
            )}

            {/* 학생 전용 */}
            {isStudent && (
              <>
                <div>
                  구분 :{" "}
                  <span className="font-bold">
                    {profile.schoolLevel
                      ? schoolLevelLabel[profile.schoolLevel]
                      : "-"}
                  </span>
                </div>
                <div>
                  학교 :{" "}
                  <span className="font-bold">
                    {profile.schoolName ?? "-"}
                  </span>{" "}
                  / 학년 :{" "}
                  <span className="font-bold">
                    {profile.grade ?? "-"}
                  </span>
                </div>
              </>
            )}

            {/* 강사 전용 */}
            {isInstructor && (
              <div>
                소속 :{" "}
                <span className="font-bold">
                  {profile.affiliation ?? "-"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-2 pt-4 border-t">
        <Link
          href="/dashboard/edit"
          className="rounded-lg border border-blue-500 px-3 py-1 text-sm 
                    text-blue-600 hover:bg-blue-500 hover:text-white 
                    transition-colors"
        >
          정보 수정
        </Link>
        {user.password && (
          <Link
            href="/dashboard/password"
            className="rounded-lg border border-orange-500 px-3 py-1 text-sm 
                      text-orange-600 hover:bg-orange-500 hover:text-white 
                      transition-colors"
          >
            비밀번호 변경
          </Link>
        )}
      </div>
    </section>


      {/* 하단 비워둔 공간 (향후 강의/수업 리스트) */}
      <section className="rounded-2xl border p-5 shadow-sm">
        <p className="text-gray-400 text-sm">별명 외의 정보는 다른 사용자에게 공개되지 않습니다.</p>
      </section>
    </main>
  );
}
