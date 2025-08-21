// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Prisma enum Role 기준으로 맞추세요 (현재 schema에 Campus 없음)
type AppRole = "Admin" | "Campus" | "Instructor" | "Student";
// 만약 Campus가 필요하면 schema.prisma의 enum Role에 Campus 추가 후 migrate 하세요.

function getRoleFromUser(u: unknown): AppRole | undefined {
  if (u && typeof u === "object" && "role" in (u as Record<string, unknown>)) {
    const r = (u as { role?: string }).role;
    if (r === "Admin" || r === "Campus" || r === "Instructor" || r === "Student") return r;
  }
  return undefined;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // DB 세션 사용: RDB에 Session 레코드가 쌓임 (서버리스에서도 안정적)
  session: { strategy: "database" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      const role = getRoleFromUser(user) ?? "Student";
      if (session.user) session.user.role = role;
      return session;
    },
    async jwt({ token, user }) {
      const role = getRoleFromUser(user);
      if (role) token.role = role;
      return token;
    },
  },
  pages: { signIn: "/signin" },
};
