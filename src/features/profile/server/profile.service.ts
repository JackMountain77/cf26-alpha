// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  // body.accountType: "STUDENT" | "TEACHER" (프론트 선택값)
  if (!body.accountType || !body.name || !body.nickname) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

  // 1) Profile upsert (accountType은 쓰지 않음)
  await prisma.profile.upsert({
    where: { userId: user.id },
    update: {
      nickname: body.nickname,
      age: body.age ?? null,
      gender: body.gender ?? "UNSPECIFIED",
      schoolLevel: body.schoolLevel ?? null,
      schoolName: body.schoolName ?? null,
      grade: body.grade ?? null,
      affiliation: body.affiliation ?? null,
    },
    create: {
      userId: user.id,
      nickname: body.nickname,
      age: body.age ?? null,
      gender: body.gender ?? "UNSPECIFIED",
      schoolLevel: body.schoolLevel ?? null,
      schoolName: body.schoolName ?? null,
      grade: body.grade ?? null,
      affiliation: body.affiliation ?? null,
    },
  });

  // 2) User 업데이트: 이름, 온보딩 완료, 역할(Role)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name,
      profileCompleted: true,
      role: body.accountType === "TEACHER" ? "Instructor" : "Student",
    },
  });

  return NextResponse.json({ ok: true });
}
