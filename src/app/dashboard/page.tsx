import { getServerSession } from "next-auth";

export default async function DashboardPage() {
  const session = await getServerSession();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <pre className="mt-4">{JSON.stringify(session, null, 2)}</pre>
    </main>
  );
}
