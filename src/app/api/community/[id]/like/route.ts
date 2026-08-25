import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";

// POST /api/community/[id]/like — 좋아요 토글 (Authorization: Bearer <supabase access token> 필요)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id: postId } = await params;

  try {
    const existing = await prisma.communityPostLike.findUnique({
      where: { userId_postId: { userId: user.id, postId } },
    });

    if (existing) {
      await prisma.communityPostLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.communityPostLike.create({ data: { userId: user.id, postId } });
    }

    const count = await prisma.communityPostLike.count({ where: { postId } });
    return NextResponse.json({ data: { liked: !existing, count } });
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return NextResponse.json({ error: "좋아요 처리 중 오류가 발생했습니다." }, { status: 400 });
  }
}
