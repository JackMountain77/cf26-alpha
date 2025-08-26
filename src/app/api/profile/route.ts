// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Gender, Role, SchoolLevel } from "@prisma/client";

/** 문자열을 다듬어 주는 헬퍼 */
const norm = (v: unknown) =>
  typeof v === "string" ? v.trim() : v === null || v === undefined ? null : v;

/** number | null 로 바꿔주는 헬퍼 */
const toIntOrNull = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/** ---------------------------------------------------
 *  GET: 프로필 조회
 * --------------------------------------------------- */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileCompleted: true,
        marketingOptIn: true,
        profile: {
          select: {
            nickname: true,
            age: true,
            gender: true,
            schoolLevel: true,
            schoolName: true,
            grade: true,
            affiliation: true,
          },
        },
      },
    });

    if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("[PROFILE_GET]", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

/** ---------------------------------------------------
 *  POST: 온보딩 시 최초 프로필 생성
 * --------------------------------------------------- */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    const accountType = norm(body.accountType) as "STUDENT" | "TEACHER" | null;
    const name = norm(body.name) as string | null;
    const nickname = norm(body.nickname) as string | null;
    const age = toIntOrNull(body.age);
    const genderIn = norm(body.gender) as keyof typeof Gender | null;
    const schoolLevelIn = norm(body.schoolLevel) as keyof typeof SchoolLevel | null;
    const schoolName = norm(body.schoolName) as string | null;
    const grade = norm(body.grade) as string | null;
    const affiliation = norm(body.affiliation) as string | null;
    const marketingOptIn = Boolean(body.marketingOptIn);

    if (!accountType || !["STUDENT", "TEACHER"].includes(accountType)) {
      return NextResponse.json({ error: "INVALID_ACCOUNT_TYPE" }, { status: 400 });
    }
    if (!name) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
    if (!nickname) return NextResponse.json({ error: "NICKNAME_REQUIRED" }, { status: 400 });
    if (age !== null && (age <= 0 || !Number.isInteger(age))) {
      return NextResponse.json({ error: "INVALID_AGE" }, { status: 400 });
    }

    const isStudent = accountType === "STUDENT";
    const mappedRole = accountType === "TEACHER" ? Role.Instructor : Role.Student;
    const mappedGender =
      genderIn && Gender[genderIn] ? (genderIn as Gender) : Gender.UNSPECIFIED;
    const mappedSchoolLevel =
      isStudent && schoolLevelIn && SchoolLevel[schoolLevelIn]
        ? (schoolLevelIn as SchoolLevel)
        : null;

    const finalSchoolName = isStudent && mappedSchoolLevel !== "GENERAL" ? schoolName : null;
    const finalGrade = isStudent && mappedSchoolLevel !== "GENERAL" ? grade : null;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { email: session.user.email! },
        data: {
          name,
          role: mappedRole,
          profileCompleted: true,
          marketingOptIn,
        },
        select: { id: true },
      });

      const profile = await tx.profile.upsert({
        where: { userId: user.id },
        update: {
          nickname,
          age,
          gender: mappedGender,
          schoolLevel: mappedSchoolLevel,
          schoolName: finalSchoolName,
          grade: finalGrade,
          affiliation: accountType === "TEACHER" ? affiliation : null,
        },
        create: {
          userId: user.id,
          nickname,
          age,
          gender: mappedGender,
          schoolLevel: mappedSchoolLevel,
          schoolName: finalSchoolName,
          grade: finalGrade,
          affiliation: accountType === "TEACHER" ? affiliation : null,
        },
      });

      return { userId: user.id, profile };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[PROFILE_POST]", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

/** ---------------------------------------------------
 *  PUT: 프로필 수정 (ProfileEditForm 전용)
 * --------------------------------------------------- */
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const name = norm(body.name) as string | null;
    const nickname = norm(body.nickname) as string | null;
    const age = toIntOrNull(body.age);
    const schoolLevelIn = norm(body.schoolLevel) as keyof typeof SchoolLevel | null;
    const schoolName = norm(body.schoolName) as string | null;
    const grade = norm(body.grade) as string | null;
    const affiliation = norm(body.affiliation) as string | null;

    if (!name) return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
    if (!nickname) return NextResponse.json({ error: "NICKNAME_REQUIRED" }, { status: 400 });
    if (age !== null && (age <= 0 || !Number.isInteger(age))) {
      return NextResponse.json({ error: "INVALID_AGE" }, { status: 400 });
    }

    // 현재 유저 role 확인
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true, role: true },
    });

    if (!user) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const isStudent = user.role === Role.Student;
    const isInstructor = user.role === Role.Instructor;

    const mappedSchoolLevel =
      isStudent && schoolLevelIn && SchoolLevel[schoolLevelIn]
        ? (schoolLevelIn as SchoolLevel)
        : null;

    const finalSchoolName = isStudent && mappedSchoolLevel !== "GENERAL" ? schoolName : null;
    const finalGrade = isStudent && mappedSchoolLevel !== "GENERAL" ? grade : null;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        profile: {
          upsert: {
            update: {
              nickname,
              age,
              schoolLevel: mappedSchoolLevel,
              schoolName: finalSchoolName,
              grade: finalGrade,
              affiliation: isInstructor ? affiliation : null,
            },
            create: {
              nickname,
              age,
              schoolLevel: mappedSchoolLevel,
              schoolName: finalSchoolName,
              grade: finalGrade,
              affiliation: isInstructor ? affiliation : null,
              
            },
          },
        },
      },
      include: { profile: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (err) {
    console.error("[PROFILE_PUT]", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
