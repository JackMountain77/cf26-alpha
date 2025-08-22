// app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 간단 이메일 정규식
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문+숫자+특수문자 포함 8자 이상
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^~])[A-Za-z\d@$!%*#?&^~]{8,}$/;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 입력 검증
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }
    if (typeof password !== "string" || !passwordRegex.test(password)) {
      return NextResponse.json({ error: "INVALID_PASSWORD" }, { status: 400 });
    }

    // 이메일 정규화(소문자 권장)
    const normEmail = email.trim().toLowerCase();

    // 기존 사용자 확인
    const existing = await prisma.user.findUnique({
      where: { email: normEmail },
      select: { id: true, password: true },
    });

    if (existing) {
      // 구글(OAuth)로만 존재하는 계정(비밀번호 없음) 케이스 분리 가능
      if (!existing.password) {
        return NextResponse.json({ error: "EMAIL_EXISTS_OAUTH_ONLY" }, { status: 409 });
      }
      return NextResponse.json({ error: "EMAIL_EXISTS" }, { status: 409 });
    }

    // 비밀번호 해시
    const hash = await bcrypt.hash(password, 12);

    // 사용자 생성 (role은 schema 기본값 Student 적용)
    const user = await prisma.user.create({
      data: {
        email: normEmail,
        password: hash,
        profileCompleted: false, // 온보딩 전
      },
      select: { id: true, email: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    console.error("[SIGNUP_POST]", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
