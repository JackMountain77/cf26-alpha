import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import OnboardingForm from "@/features/onboarding/components/onboarding-form";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/signin");

  return <OnboardingForm />;
}
