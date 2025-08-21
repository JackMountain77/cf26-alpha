// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

type AppRole = "Admin" | "Instructor" | "Student";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" }, // 유지
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // database 전략에서는 token이 안 올 수 있음 → user 우선
    async session({ session, user }) {
      if (!session.user) return session;

      // 로그인 직후엔 user가 있음. 이후 요청에선 없을 수 있으니 DB에서 보강
      let role: AppRole | undefined = (user as any)?.role;
      if (!role && session.user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { role: true },
        });
        role = (dbUser?.role as AppRole) ?? "Student";
      }
      (session.user as any).role = role ?? "Student";
      return session;
    },

    // 있어도 무방하지만 database 전략에선 필수 아님
    async jwt({ token, user }) {
      if (user) token.role = (user as any)?.role ?? "Student";
      return token;
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};
