import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";
import { ensureProfileSchema } from "@/features/auth/schema";

// POST /api/profile — Supabase Auth 회원가입 직후 Prisma User 프로필 레코드 생성(없으면).
// 웹 signup Server Action의 2단계(Prisma User 생성)와 동일한 로직 — RN은 Auth SDK로
// 직접 auth.signUp() 후 이 엔드포인트를 호출해 프로필을 만든다.
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ensureProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값을 다시 확인해주세요.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  if (existing) {
    return NextResponse.json({ data: existing });
  }

  if (!user.email) {
    return NextResponse.json({ error: "이메일 정보를 확인할 수 없습니다." }, { status: 400 });
  }

  const profile = await prisma.user.create({
    data: { id: user.id, email: user.email, nickname: parsed.data.nickname },
  });

  return NextResponse.json({ data: profile }, { status: 201 });
}
