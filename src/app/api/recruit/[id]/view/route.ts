import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";

// POST /api/recruit/[id]/view — 조회수 증가 (인증 불필요, 웹 상세 페이지 마운트 시 1회 호출).
// 쿠키로 "이미 센 글"을 24시간 동안 기억해 같은 방문자의 중복 카운트를 막음.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const cookieName = `viewed_recruit_${id}`;

  if (cookieStore.get(cookieName)) {
    const recruit = await prisma.recruit.findUnique({
      where: { id },
      select: { viewCount: true },
    });
    return NextResponse.json({ data: { viewCount: recruit?.viewCount ?? 0 } });
  }

  try {
    const recruit = await prisma.recruit.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    cookieStore.set(cookieName, "1", { maxAge: 60 * 60 * 24, path: "/" });
    return NextResponse.json({ data: { viewCount: recruit.viewCount } });
  } catch {
    return NextResponse.json({ data: { viewCount: 0 } });
  }
}
