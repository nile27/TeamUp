import { NextResponse } from "next/server";
import { getCommunityPosts } from "@/features/community/queries";
import type { CommunityTag } from "@prisma/client";

const VALID_TAGS: CommunityTag[] = ["IDEA", "QUESTION", "ETC"];

// GET /api/community?tag=IDEA&page=2 — 커뮤니티 글 목록 (조회 전용, 작성/댓글/좋아요는 API 없음)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tagParam = searchParams.get("tag");
  const tag = tagParam && VALID_TAGS.includes(tagParam as CommunityTag) ? (tagParam as CommunityTag) : undefined;

  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;

  const { posts, totalPages } = await getCommunityPosts(tag, page);
  return NextResponse.json({ data: { posts, page, totalPages } });
}
