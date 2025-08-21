import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInCard from "./sign-in-card";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard"); // 이미 로그인 상태면 대시보드로
  }
  return <SignInCard />;
}
