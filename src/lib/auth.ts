// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Prisma enum Role 기준으로 맞추세요 (현재 schema에 Campus 없음)
type AppRole = "Admin" | "Campus" | "Instructor" | "Student";

function getRoleFromUser(u: unknown): AppRole | undefined {
  if (u && typeof u === "object" && "role" in (u as Record<string, unknown>)) {
    const r = (u as { role?: string }).role;
    if (r === "Admin" || r === "Campus" || r === "Instructor" || r === "Student") return r;
  }
  return undefined;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: { strategy: "database" },

  secret: process.env.NEXTAUTH_SECRET,
  //debug: process.env.NODE_ENV !== "production",  

  providers: [
    // ✅ Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // (선택) 최초 구글 가입 후 Onboarding 으로 보내고 싶다면
      // signIn() 호출 시 callbackUrl: "/onboarding" 를 사용하세요.
    }),

    // ✅ Credentials (이메일/비밀번호)
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        // 사용자 조회
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,          // 해시 존재해야 함
            profileCompleted: true,  // 세션에 올리기 위해 조회
          },
        });

        if (!user || !user.password) {
          // 존재하지 않거나, OAuth-only 계정(비번 없음)
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // NextAuth는 user 객체를 반환하면 로그인 성공으로 처리
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          profileCompleted: user.profileCompleted,
        } as any;
      },
    }),
  ],

  callbacks: {
    /**
     * DB 세션(strategy: "database")에서는 session 콜백의 두 번째 인자에
     * 항상 DB상의 user 레코드가 들어옵니다.
     */
    async session({ session, user }) {
      const role = getRoleFromUser(user) ?? "Student";
      if (session.user) {
        // role
        (session.user as any).role = role;
        // profileCompleted (온보딩 여부)
        if ("profileCompleted" in (user as any)) {
          (session.user as any).profileCompleted = (user as any).profileCompleted ?? false;
        } else {
          // 방어적으로 DB 조회 (이 케이스는 드뭅니다)
          const u = await prisma.user.findUnique({
            where: { email: session.user.email! },
            select: { profileCompleted: true },
          });
          (session.user as any).profileCompleted = u?.profileCompleted ?? false;
        }
      }
      return session;
    },

    /**
     * DB 세션에서도 jwt 콜백은 호출되지만, 실제 세션 저장은 DB를 사용합니다.
     * 여기서는 role 등을 토큰에 실어두는 보조용도로만 사용(선택).
     */
    async jwt({ token, user }) {
      const role = getRoleFromUser(user);
      if (role) (token as any).role = role;

      if (user && (user as any).profileCompleted !== undefined) {
        (token as any).profileCompleted = (user as any).profileCompleted;
      }
      return token;
    },
  },

  // events: {
  //   async signIn({ user })       { console.log("[events] signIn", user?.email); },
  //   async createUser({ user })   { console.log("[events] createUser", user?.email); },
  //   async linkAccount({ user })  { console.log("[events] linkAccount", user?.email); },
  //   async session({ session })   { console.log("[events] session", session?.user?.email); },    
  // },

  pages: { signIn: "/signin" },
};
