export const runtime = "nodejs";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" }, // 세션 DB 저장(안정적)
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // 세션에 role 포함
      if (session.user) (session.user as any).role = user.role;
      return session;
    },
  },
  pages: {
    signIn: "/signin", // 선택: 커스텀 로그인 페이지 사용 시
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
