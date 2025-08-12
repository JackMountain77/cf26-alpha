import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    // 로그인 필요 페이지 보호: 예시는 /app, /dashboard 하위 보호
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      const protectedPrefixes = ["/app", "/dashboard"];
      const needsAuth = protectedPrefixes.some((p) => pathname.startsWith(p));

      if (!needsAuth) return true;          // 공개 페이지 통과
      if (token) return true;               // 로그인 됨
      return false;                         // 로그인 필요
    },
  },
});

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*"],
};
