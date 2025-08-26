// app/(protected)/dashboard/password/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PasswordChangeForm from "@/features/profile/components/password-change-form";

export default async function PasswordChangePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    // 세션이 없는 경우는 이미 middleware에서 막히지만, 안전망으로 한 번 더 체크
    redirect("/signin");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: { password: true },
  });

  // 구글/소셜 로그인 → password 없음 → 접근 불가
  if (!user?.password) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">비밀번호 변경</h1>
        <p className="mt-1 text-sm text-gray-500">
          계정 보안을 위해 비밀번호를 주기적으로 변경하여 사용해주세요.
        </p>
      </header>

      <section className="rounded-2xl border p-5 shadow-sm">
        <PasswordChangeForm />
      </section>
    </main>
  );
}
