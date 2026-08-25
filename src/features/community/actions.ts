"use server";

import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/server/supabase";
import { createPostSchema, updatePostSchema, createCommentSchema } from "./schema";
import { createRecruitSchema } from "@/features/recruit/schema";

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

  // 모집글은 커뮤니티 글보다 제목·소개 최소 길이가 엄격함(각각 5자/10자 이상).
  // 검증 없이 그대로 승격하면 나중에 이 모집글을 수정할 때 손대지도 않은
  // 제목/소개가 현재 스키마에 걸려 저장이 막히는 문제가 생겨 여기서 미리 막는다.
  const titleContentCheck = createRecruitSchema
    .pick({ title: true, content: true })
    .safeParse({ title: post.title, content: post.content });
  if (!titleContentCheck.success) {
    const message = titleContentCheck.error.issues[0]?.message ?? "제목/소개를 조금 더 작성해주세요.";
    redirect(`/community/${postId}?promoteError=${encodeURIComponent(`모집글로 만들기엔 내용이 부족해요. ${message}`)}`);
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

  // 클라이언트(LikeButton)가 낙관적 업데이트를 하기 때문에, 여기서 던지는 모든 예외를
  // {error}로 변환해줘야 함 — 안 그러면 실패해도 낙관적으로 뒤집힌 화면이 롤백 안 되고
  // 그대로 남아있다가 새로고침해야 진짜 상태(반영 안 됨)가 드러나는 버그가 생김.
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
    revalidatePath("/dashboard");
    return { liked: !existing, count };
  } catch (error) {
    console.error("Toggle Like Error:", error);
    return { error: "좋아요 처리 중 오류가 발생했습니다." };
  }
}
