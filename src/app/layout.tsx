import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CodingFriends",
  description: "CodingFriends — test",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
