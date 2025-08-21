import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const { user } = session;
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">대시보드</h1>
      <div className="mt-4 text-sm text-gray-600">
        <div>이름: {user?.name ?? "사용자"}</div>
        <div>이메일: {user?.email ?? ""}</div>
        <div>역할: {(user as any)?.role ?? "Student"}</div>
      </div>
    </main>
  );
}
