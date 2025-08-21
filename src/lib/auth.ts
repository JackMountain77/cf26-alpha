// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

        return user; // DB User 그대로 반환
      },
    }),
  ],

  // ✅ 여기에서 events.signIn 정의
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        const sessionToken = crypto.randomUUID();
        const sessionMaxAge = 30 * 24 * 60 * 60; // 30일
        const expires = new Date(Date.now() + sessionMaxAge * 1000);

        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.id,
            expires,
          },
        });

        console.log("✅ Forced Session insert for Credentials:", {
          userId: user.id,
          sessionToken,
        });
      }
    },
  },

  pages: { signIn: "/signin" },
};
