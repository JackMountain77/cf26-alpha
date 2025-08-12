import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { AppRole } from "@/types/next-auth"; // 위에서 선언한 타입
import type { AdapterUser } from "next-auth/adapters";

export const runtime = "nodejs";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    // JWT에 role을 먼저 싣고
    async jwt({ token, user }) {
      if (user) {
        const u = user as AdapterUser & { role?: AppRole };
        token.role = u.role;
      }
      return token;
    },

    // Session으로 role을 안전하게 복사
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },

  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
