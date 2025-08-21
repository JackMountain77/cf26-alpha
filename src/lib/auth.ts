// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// types/next-auth.d.ts 에 정의된 타입을 사용하므로 AppRole 타입 정의는 필요 없음

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
        const email = credentials?.email?.trim();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            password: true,
            profileCompleted: true,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // as any 제거: 확장된 User 타입에 맞춰서 반환
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          profileCompleted: user.profileCompleted,
        };
      },
    }),
  ],

 callbacks: {
    // signIn 콜백을 사용해서 반환값을 명확히 해줍니다.
    async signIn({ user, account, profile }) {
        if (account?.provider === 'credentials') {
            // PrismaAdapter가 예상하는 AdapterUser 타입에 맞추기 위해 객체를 재구성
            const newUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image
            };
            console.log('Credentials login, returning user:', newUser);
            return newUser;
        }
        
        // 다른 프로바이더는 기본값으로 진행
        return true;
    },
    
    // session 콜백은 DB의 user 레코드를 받기 때문에 이제 정상적으로 동작할 것입니다.
    async session({ session, user }) {
        if (session.user && user) {
            session.user.role = user.role;
            session.user.profileCompleted = user.profileCompleted;
        }
        return session;
    },

    // jwt 콜백은 DB 세션 전략에서는 보조 용도이므로 그대로 둡니다.
    async jwt({ token, user }) {
        if (user) {
            token.role = user.role;
            token.profileCompleted = user.profileCompleted;
        }
        return token;
    },
},


  // events를 추가하여 signIn 이벤트를 처리
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`[events] signIn: user.id=${user?.id}, provider=${account?.provider}, isNewUser=${isNewUser}`);

      // credentials로 로그인 했을 때만 추가 로그
      if (account?.provider === "credentials") {
        console.log("Credentials login successful, user object:", user);
      }
    },
  },

  pages: { signIn: "/signin" },
};