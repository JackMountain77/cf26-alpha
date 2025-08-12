import "next-auth";
import "next-auth/jwt";

// Prisma enum을 쓰면 가장 깔끔 (없으면 문자열 리터럴로 써도 됨)
export type AppRole = "Admin" | "Instructor" | "Student";

declare module "next-auth" {
  interface User {
    role: AppRole;
  }
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: AppRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: AppRole;
  }
}
