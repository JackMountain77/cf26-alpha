import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

type AppRole = "Admin" | "Instructor" | "Student";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/signin?callbackUrl=/dashboard");
  }

  const role: AppRole = session.user?.role ?? "Student";
  const name = session.user?.name ?? "사용자";
  const email = session.user?.email ?? "";
  const image = session.user?.image ?? "";

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-6 flex items-center gap-4">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="avatar" className="w-12 h-12 rounded-full" />
        ) : null}
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-sm text-gray-500">{email}</div>
          <div className="mt-1 text-sm">Role: {role}</div>
        </div>
      </div>
    </main>
  );
}
