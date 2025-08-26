// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

export const authOptions: NextAuthOptions = {
  // 세션 테이블 미사용 (JWT)
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  //secret: process.env.NEXTAUTH_SECRET,
  secret: env.NEXTAUTH_SECRET,

  // OAuth(User/Account) 저장은 어댑터 유지, 세션 테이블은 쓰지 않음
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

        return user; // 필요한 필드는 jwt 콜백에서 싣습니다.
      },
    }),
    ...(googleProvider ? [googleProvider] : []),
  ],

  callbacks: {
    // 로그인 시 토큰에 필요한 정보 싣기
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.profileCompleted = user.profileCompleted ?? false;
        token.email = user.email ?? token.email;
      }
      return token;
    },
    // 클라이언트에서 사용할 세션 형태로 변환
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
