import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInCard from "@/features/auth/components/sign-in-card";

export const metadata = {
  title: "Sign in",
};

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return <SignInCard />;
}
