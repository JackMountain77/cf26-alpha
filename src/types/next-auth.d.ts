// types/next-auth.d.ts (폴더/파일명은 예시)
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "Admin" | "Instructor" | "Student";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "Admin" | "Instructor" | "Student";
  }
}
