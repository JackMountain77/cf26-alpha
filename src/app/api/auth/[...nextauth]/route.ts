export const runtime = "nodejs";

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { AdapterUser } from "next-auth/adapters";

// our app roles
type AppRole = "Admin" | "Instructor" | "Student";

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
    async jwt({ token, user }) {
      if (user) {
        const u = user as AdapterUser & { role?: AppRole };
        token.role = u.role ?? "Student";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        // 타입 단언 없이 안전하게 대입
        (session.user as { role?: AppRole }).role = token.role as AppRole;
      }
      return session;
    },
  },
  pages: { signIn: "/signin" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
