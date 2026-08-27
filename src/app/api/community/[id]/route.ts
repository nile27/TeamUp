import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCommunityPostById, getLikeForUser } from "@/features/community/queries";
import { getUserFromRequest } from "@/server/api-auth";
import { prisma } from "@/server/db";

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

// DELETE /api/community/[id] — 커뮤니티 글 삭제 (작성자 본인만, Authorization: Bearer <supabase access token> 필요)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const post = await prisma.communityPost.findUnique({ where: { id }, select: { authorId: true } });
  if (!post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  if (post.authorId !== user.id) {
    return NextResponse.json({ error: "작성자만 삭제할 수 있습니다." }, { status: 403 });
  }

  // Comment/CommunityPostLike는 schema.prisma에서 onDelete: Cascade로 걸려있어
  // 이 한 줄로 연관 데이터까지 함께 삭제됨.
  await prisma.communityPost.delete({ where: { id } });

  revalidatePath("/community");
  revalidatePath("/dashboard");

  return NextResponse.json({ data: { deleted: true } });
}
