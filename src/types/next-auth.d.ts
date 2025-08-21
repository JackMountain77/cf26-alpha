// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

// `role`과 `profileCompleted` 속성을 포함하는 커스텀 `User` 인터페이스 정의
interface MyUser extends DefaultUser {
  role?: "Admin" | "Campus" | "Instructor" | "Student";
  profileCompleted?: boolean;
}

// Session 타입 확장
declare module "next-auth" {
  interface Session {
    user?: MyUser;
  }
}

// JWT 타입 확장
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: "Admin" | "Campus" | "Instructor" | "Student";
    profileCompleted?: boolean;
  }
}


// types/next-auth.d.ts (폴더/파일명은 예시)
/*
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "Admin" | "Campus" | "Instructor" | "Student";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "Admin" | "Campus" | "Instructor" | "Student";
  }
}
*/