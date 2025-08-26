// app/api/profile/password/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// 비밀번호 정책: 영문, 숫자, 특수문자 포함 8자리 이상
const passwordPolicy =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!newPassword || !passwordPolicy.test(newPassword)) {
      return NextResponse.json(
        { error: "새 비밀번호는 영문, 숫자, 특수문자를 포함한 8자리 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, password: true },
    });

    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    if (!user.password) {
      // 소셜 로그인 사용자는 접근 불가
      return NextResponse.json(
        { error: "소셜 로그인 계정은 비밀번호 변경이 불가능합니다." },
        { status: 403 }
      );
    }

    // 현재 비밀번호 확인
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
    }

    // 새 비밀번호 해싱 후 저장
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed },
    });

    return NextResponse.json({
      ok: true,
      message: "비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.",
    });
  } catch (err) {
    console.error("[PASSWORD_PUT]", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
