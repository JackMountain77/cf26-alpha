import "next-auth";
import "next-auth/jwt";

export type AppRole = "Admin" | "Instructor" | "Student";

declare module "next-auth" {
  interface User { role: AppRole }
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
  interface JWT { role?: AppRole }
}
