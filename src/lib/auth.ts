import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// 앱에서 쓰는 역할 타입 (동일 유지)
type AppRole = "Admin" | "Campus" | "Instructor" | "Student";

// User 객체에서 역할을 안전하게 추출
function getRoleFromUser(u: unknown): AppRole | undefined {
  if (u && typeof u === "object" && "role" in (u as Record<string, unknown>)) {
    const r = (u as { role?: AppRole }).role;
    if (r === "Admin" || r === "Instructor" || r === "Student") return r;
  }
  return undefined;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // database 전략: user 기반으로 role 주입
        session.user.role = getRoleFromUser(user) ?? "Student";
      }
      return session;
    },
    async jwt({ token, user }) {
      // 필수는 아니지만 로그인 직후 token에도 role 심어둠
      const role = getRoleFromUser(user);
      if (role) token.role = role;
      return token;
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};
