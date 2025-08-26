import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileEditForm from "@/features/profile/components/profile-edit-form";

export default async function EditPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/signin?callbackUrl=/dashboard/edit");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
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

  if (!user) redirect("/dashboard");
  const profile = user.profile;

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      {/* 상단 기본 정보 (읽기 전용) */}
      <section className="rounded-2xl border p-5 shadow-sm flex items-center gap-4">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="avatar" className="h-14 w-14 rounded-full border" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full border bg-blue-200 text-lg text-gray-900">
            {profile.nickname.charAt(0) ?? "?"}
          </div>
        )}
        <div>
          <div className="font-medium">{profile.nickname ?? "사용자"}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
          <div className="mt-1 text-sm">
            Role: <span className="font-semibold">{user.role}</span>
          </div>
        </div>
      </section>

      {/* 수정 폼 */}
      <section className="rounded-2xl border p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">내 정보 수정</h2>
        <ProfileEditForm user={user} />
      </section>
    </main>
  );
}
