// src/middleware.ts
export { default } from "next-auth/middleware";

// (protected) 라우트 보호 설정
export const config = {
  matcher: ["/dashboard/:path*"], // 모든 dashboard/* 라우트는 세션 필요
};
