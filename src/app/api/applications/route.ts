import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
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

  const recruit = await prisma.recruit.findUnique({
    where: { id: recruitId },
    select: { authorId: true },
  });
  if (!recruit) {
    return NextResponse.json({ error: "모집을 찾을 수 없습니다." }, { status: 404 });
  }
  if (recruit.authorId === user.id) {
    return NextResponse.json({ error: "본인이 등록한 모집글에는 지원할 수 없습니다." }, { status: 400 });
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
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "이미 지원한 모집입니다." }, { status: 400 });
    }
    console.error("Apply To Recruit Error:", error);
    return NextResponse.json(
      { error: "지원 처리 중 오류가 발생했습니다." },
      { status: 400 }
    );
  }

  try {
    // updateTag는 Server Action 전용 — Route Handler(이 파일)에서 부르면 매번 throw함
    // (features/recruit/actions.ts의 applyToRecruit은 Server Action이라 updateTag 사용 가능).
    // "max" 프로필로 즉시 만료시켜 updateTag와 동일한 무효화 효과를 냄.
    revalidateTag(`recruit-${recruitId}`, "max");
  } catch (error) {
    // 그래도 캐시 무효화 실패로 이미 커밋된 지원 생성 응답 자체를 500으로 깨뜨리면 안 됨
    // (지원은 DB에 이미 저장됐는데 클라이언트엔 실패로 보이는 문제 방지).
    console.error("Recruit cache invalidation failed after application create:", error);
  }
  return NextResponse.json({ data: application }, { status: 201 });
}
