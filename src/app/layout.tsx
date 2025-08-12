// 서버 컴포넌트에서
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <html lang="ko">
      <body>
        <header className="p-4 border-b flex gap-4">
          <Link href="/">CF26</Link>
          <nav className="ml-auto">
            {session?.user ? (
              <span>Hi, {session.user.name ?? "User"} ({session.user.role})</span>
            ) : (
              <Link href="/signin">Sign in</Link>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
