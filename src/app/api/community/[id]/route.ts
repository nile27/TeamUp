import { NextResponse } from "next/server";
import { getCommunityPostById, getLikeForUser } from "@/features/community/queries";
import { getUserFromRequest } from "@/server/api-auth";

// GET /api/community/[id] — 커뮤니티 글 상세(댓글 포함). 로그인 상태면 alreadyLiked 포함.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const post = await getCommunityPostById(id);

  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  const user = await getUserFromRequest(request);
  const like = user ? await getLikeForUser(post.id, user.id) : null;

  return NextResponse.json({ data: { ...post, alreadyLiked: !!like } });
}
