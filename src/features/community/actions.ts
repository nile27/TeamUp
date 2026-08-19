"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/server/supabase";
import { createPostSchema, createCommentSchema } from "./schema";

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
