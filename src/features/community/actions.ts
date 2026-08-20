"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/server/supabase";
import { createPostSchema, updatePostSchema, createCommentSchema } from "./schema";

export type CommunityActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
} | null;

export async function createPost(
  prevState: CommunityActionState,
  formData: FormData
): Promise<CommunityActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = createPostSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message;
    });
    return { error: "입력값을 다시 확인해주세요.", fieldErrors };
  }

  let postId: string;
  try {
    const post = await prisma.communityPost.create({
      data: { ...parsed.data, authorId: user.id },
    });
    postId = post.id;
  } catch (error) {
    console.error("Create Post Error:", error);
    return { error: "글 등록 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/community");
  revalidatePath("/dashboard");
  redirect(`/community/${postId}`);
}

export async function updatePost(
  prevState: CommunityActionState,
  formData: FormData
): Promise<CommunityActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const postId = String(formData.get("postId") || "");
  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) {
    notFound();
  }
  if (post.authorId !== user.id) {
    redirect(`/community/${postId}`);
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = updatePostSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message;
    });
    return { error: "입력값을 다시 확인해주세요.", fieldErrors };
  }

  try {
    await prisma.communityPost.update({
      where: { id: postId },
      data: parsed.data,
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    return { error: "글 수정 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  redirect(`/community/${postId}`);
}

export async function createComment(
  prevState: CommunityActionState,
  formData: FormData
): Promise<CommunityActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const postId = String(formData.get("postId") || "");
  const parsed = createCommentSchema.safeParse({ content: formData.get("content") });

  if (!postId) {
    return { error: "잘못된 요청입니다." };
  }
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "댓글을 입력해주세요." };
  }

  try {
    await prisma.comment.create({
      data: { content: parsed.data.content, postId, authorId: user.id },
    });
  } catch (error) {
    console.error("Create Comment Error:", error);
    return { error: "댓글 등록 중 오류가 발생했습니다." };
  }

  revalidatePath(`/community/${postId}`);
  return { success: true };
}

export async function promoteToRecruit(formData: FormData): Promise<void> {
  const postId = String(formData.get("postId") || "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const post = await prisma.communityPost.findUnique({ where: { id: postId } });
  if (!post) {
    redirect("/community");
  }
  if (post.authorId !== user.id) {
    redirect(`/community/${postId}?promoteError=${encodeURIComponent("작성자만 정식 모집으로 만들 수 있어요.")}`);
  }

  let recruitId: string;
  try {
    const recruit = await prisma.recruit.create({
      data: {
        type: "DEV",
        title: post.title,
        content: post.content,
        authorId: user.id,
        promotedFromId: post.id,
        roles: { create: [{ name: "팀원", count: 1 }] },
      },
    });
    recruitId = recruit.id;
  } catch (error) {
    console.error("Promote To Recruit Error:", error);
    redirect(`/community/${postId}?promoteError=${encodeURIComponent("이미 정식 모집으로 등록된 아이디어예요.")}`);
  }

  revalidatePath("/recruit");
  redirect(`/recruit/${recruitId}`);
}

// 상세 페이지 진입 시 호출. 커뮤니티 상세는 ISR이 아니라 매 요청 SSR이라
// 캐시 걱정 없이 바로 늘리고 최신 값을 반환.
export async function incrementPostViewCount(postId: string): Promise<number> {
  try {
    const post = await prisma.communityPost.update({
      where: { id: postId },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return post.viewCount;
  } catch {
    return 0;
  }
}

// 좋아요 토글. 버튼 클릭으로 바로 호출하는 형태.
export async function toggleCommunityPostLike(
  postId: string
): Promise<{ liked: boolean; count: number } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  const existing = await prisma.communityPostLike.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });

  if (existing) {
    await prisma.communityPostLike.delete({ where: { id: existing.id } });
  } else {
    try {
      await prisma.communityPostLike.create({ data: { userId: user.id, postId } });
    } catch (error) {
      console.error("Toggle Like Error:", error);
      return { error: "좋아요 처리 중 오류가 발생했습니다." };
    }
  }

  const count = await prisma.communityPostLike.count({ where: { postId } });
  revalidatePath("/dashboard");
  return { liked: !existing, count };
}
