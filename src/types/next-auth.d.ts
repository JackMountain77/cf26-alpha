import type { DefaultSession } from "next-auth";
import "next-auth/jwt";

/** 앱에서 쓰는 역할 타입 (현행 유지) */
export type AppRole = "Admin" | "Instructor" | "Student";

declare module "next-auth" {
  /** DB의 User 레코드가 갖는 역할 */
  interface User {
    role: AppRole;
  }

  /** 세션의 user에 role을 추가 (기본 user 타입을 승계) */
  interface Session {
    user?: DefaultSession["user"] & {
      role?: AppRole; // 콜백에서 항상 채워주지만 안전하게 optional 유지
    };
  }
}

declare module "next-auth/jwt" {
  /** JWT에도 역할을 실어둘 수 있게 보강 */
  interface JWT {
    role?: AppRole;
  }
}

/** 이 파일을 모듈로 인식시키기 위함 */
export {};
