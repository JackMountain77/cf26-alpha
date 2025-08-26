// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";   // ✅ 반드시 env 사용

const googleProvider = Google({
  clientId: env.GOOGLE_CLIENT_ID,
  clientSecret: env.GOOGLE_CLIENT_SECRET,
});

export const authOptions: NextAuthOptions = {
  // 세션 테이블 미사용 (JWT)
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },

  // ✅ 반드시 env에서 읽기
  secret: env.NEXTAUTH_SECRET,

  adapter: PrismaAdapter(prisma),

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        return user;
      },
    }),
    googleProvider, // ✅ env 기반으로 항상 주입
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.profileCompleted = user.profileCompleted ?? false;
        token.email = user.email ?? token.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...(session.user || {}),
        id: token.userId as string,
        role: token.role ?? "Student",
        profileCompleted: token.profileCompleted ?? false,
        email: token.email as string | undefined,
      };
      return session;
    },
  },

  pages: { signIn: "/signin" },
};
