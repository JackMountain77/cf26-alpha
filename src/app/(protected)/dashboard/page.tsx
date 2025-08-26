// app/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Gender, Role, SchoolLevel } from "@prisma/client";

// 라벨 변환 (표시용)
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
  if (!session?.user.profileCompleted) {
    redirect("/onboarding");
  }

  // 세션의 이메일로 사용자+프로필 조회
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
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

  if (!user) {
    // 이 케이스는 드물지만, 안전망
    redirect("/signin?callbackUrl=/dashboard");
  }

  // (옵션) 온보딩 미완료 시 온보딩으로 보내고 싶다면:
  // if (!user.profileCompleted) redirect("/onboarding");

  const displayName = user.name ?? "사용자";
  const displayEmail = user.email ?? "";
  const displayRole = roleLabel[user.role];
  const profile = user.profile;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            user.profileCompleted
              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          }`}
          title={user.profileCompleted ? "온보딩 완료" : "온보딩 미완료"}
        >
          {user.profileCompleted ? "온보딩 완료" : "온보딩 미완료"}
        </span>
      </header>

      {/* 사용자 기본 정보 */}
      <section className="rounded-2xl border p-5 shadow-sm">
        <div className="flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="avatar" className="h-12 w-12 rounded-full border" />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-gray-50 text-sm text-gray-500">
              {displayName.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-sm text-gray-500">{displayEmail}</div>
            <div className="mt-1 text-sm">
              Role: <span className="font-medium">{displayRole}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 프로필 상세 정보 */}
      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">내 프로필</h2>
        {!profile ? (
          <p className="text-sm text-gray-500">추가 프로필 정보가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* 왼쪽 컬럼 */}
            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-gray-500">공개이름(별명)</div>
                <div className="font-medium">{profile.nickname ?? "-"}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">나이</div>
                <div className="font-medium">{profile.age ?? "-"}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">성별</div>
                <div className="font-medium">
                  {profile.gender ? genderLabel[profile.gender] : "-"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">마케팅 정보 수신</div>
                <div className="font-medium">{user.marketingOptIn ? "동의" : "미동의"}</div>
              </div>
            </div>

            {/* 오른쪽 컬럼 */}
            <div className="space-y-3">
              <div className="text-sm">
                <div className="text-gray-500">구분(학생)</div>
                <div className="font-medium">
                  {profile.schoolLevel ? schoolLevelLabel[profile.schoolLevel] : "-"}
                </div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">학교</div>
                <div className="font-medium">{profile.schoolName ?? "-"}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">학년</div>
                <div className="font-medium">{profile.grade ?? "-"}</div>
              </div>
              <div className="text-sm">
                <div className="text-gray-500">소속(강사)</div>
                <div className="font-medium">{profile.affiliation ?? "-"}</div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
