import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import OnboardingForm from "@/features/onboarding/components/onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  // 로그인 안 했으면 로그인 페이지로
  if (!session) redirect("/signin");

  // 이미 완료된 사용자는 대시보드로
  const completed = (session as any)?.user?.profileCompleted ?? false;
  if (completed) redirect("/dashboard");

  return <OnboardingForm />;
}
