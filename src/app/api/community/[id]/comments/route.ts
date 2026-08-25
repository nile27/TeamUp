import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/server/api-auth";
import { createCommentSchema } from "@/features/community/schema";
import { prisma } from "@/server/db";

// POST /api/community/[id]/comments — 댓글 작성 (Authorization: Bearer <supabase access token> 필요)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id: postId } = await params;
  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값을 다시 확인해주세요.", fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const comment = await prisma.comment.create({
      data: { content: parsed.data.content, postId, authorId: user.id },
      include: { author: { select: { nickname: true } } },
    });
    return NextResponse.json({ data: comment }, { status: 201 });
  } catch (error) {
    console.error("Create Comment Error:", error);
    return NextResponse.json({ error: "댓글 등록 중 오류가 발생했습니다." }, { status: 400 });
  }
}
