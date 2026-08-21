import { NextResponse } from "next/server";
import { updateTag } from "next/cache";
import { applyToRecruitSchema } from "@/features/recruit/schema";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";

// POST /api/applications — 지원 (Authorization: Bearer <supabase access token> 필요)
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const recruitId = String(body.recruitId || "");
  if (!recruitId) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = applyToRecruitSchema.safeParse({ message: body.message });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값을 다시 확인해주세요.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  let application;
  try {
    application = await prisma.application.create({
      data: {
        applicantId: user.id,
        recruitId,
        message: parsed.data.message,
      },
    });
  } catch (error) {
    console.error("Apply To Recruit Error:", error);
    return NextResponse.json(
      { error: "이미 지원했거나, 지원 처리 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }

  updateTag(`recruit-${recruitId}`);
  return NextResponse.json({ data: application }, { status: 201 });
}
