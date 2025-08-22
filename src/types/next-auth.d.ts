// src/types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

/**
 * Extend NextAuth User shape (DB user shape may include these fields)
 */
declare module "next-auth" {
  interface User extends DefaultUser {
    role?: "Admin" | "Campus" | "Instructor" | "Student";
    profileCompleted?: boolean;
  }

  /**
   * What the client receives via useSession/getServerSession
   * Must mirror the fields you project in callbacks.session
   */
  interface Session {
    user: {
      id: string;
      role: "Admin" | "Campus" | "Instructor" | "Student";
      profileCompleted: boolean;
    } & DefaultSession["user"];
  }
}

/**
 * JWT payload stored in the token cookie
 * Must mirror the fields you set in callbacks.jwt
 */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    role?: "Admin" | "Campus" | "Instructor" | "Student";
    profileCompleted?: boolean;
  }
}

/**
 * Make this file a module to ensure the augmentation is applied
 */
export {};
