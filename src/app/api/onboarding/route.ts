// src/app/api/onboarding/route.ts
// dummy handler
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "onboarding API placeholder" });
}