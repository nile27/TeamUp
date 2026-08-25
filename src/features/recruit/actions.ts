"use server";

import { revalidatePath, updateTag } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/server/supabase";
import { createRecruitSchema, updateRecruitSchema, applyToRecruitSchema } from "./schema";
import { calcCompleteness } from "./completeness";

export type RecruitActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
} | null;

export async function createRecruit(
  prevState: RecruitActionState,
  formData: FormData
): Promise<RecruitActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const raw = Object.fromEntries(formData.entries());

  let techStack: unknown = [];
  let roles: unknown = [];
  try {
    techStack = JSON.parse(String(raw.techStack || "[]"));
    roles = JSON.parse(String(raw.roles || "[]"));
  } catch {
    return { error: "입력값이 올바르지 않습니다. 다시 시도해주세요." };
  }

  const parsed = createRecruitSchema.safeParse({
    type: raw.type,
    title: raw.title,
    content: raw.content,
    techStack,
    roles,
    problem: raw.problem || undefined,
    targetUser: raw.targetUser || undefined,
    coreFeatures: raw.coreFeatures || undefined,
    reference: raw.reference || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message;
    });
    return { error: "입력값을 다시 확인해주세요.", fieldErrors };
  }

  const completeness = calcCompleteness(parsed.data);

  let recruitId: string;
  try {
    const recruit = await prisma.recruit.create({
      data: {
        type: parsed.data.type,
        title: parsed.data.title,
        content: parsed.data.content,
        techStack: parsed.data.techStack,
        problem: parsed.data.problem,
        targetUser: parsed.data.targetUser,
        coreFeatures: parsed.data.coreFeatures,
        reference: parsed.data.reference,
        completeness,
        authorId: user.id,
        roles: {
          create: parsed.data.roles.map((role) => ({ name: role.name, count: role.count })),
        },
      },
    });
    recruitId = recruit.id;
  } catch (error) {
    console.error("Create Recruit Error:", error);
    return { error: "모집 등록 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/recruit");
  revalidatePath("/dashboard");
  redirect(`/recruit/${recruitId}`);
}

export async function updateRecruit(
  prevState: RecruitActionState,
  formData: FormData
): Promise<RecruitActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const recruitId = String(formData.get("recruitId") || "");
  const recruit = await prisma.recruit.findUnique({ where: { id: recruitId } });
  if (!recruit) {
    notFound();
  }
  if (recruit.authorId !== user.id) {
    redirect(`/recruit/${recruitId}`);
  }

  const raw = Object.fromEntries(formData.entries());

  let techStack: unknown = [];
  let roles: unknown = [];
  try {
    techStack = JSON.parse(String(raw.techStack || "[]"));
    roles = JSON.parse(String(raw.roles || "[]"));
  } catch {
    return { error: "입력값이 올바르지 않습니다. 다시 시도해주세요." };
  }

  const parsed = updateRecruitSchema.safeParse({
    type: raw.type,
    title: raw.title,
    content: raw.content,
    techStack,
    roles,
    problem: raw.problem || undefined,
    targetUser: raw.targetUser || undefined,
    coreFeatures: raw.coreFeatures || undefined,
    reference: raw.reference || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message;
    });
    return { error: "입력값을 다시 확인해주세요.", fieldErrors };
  }

  const completeness = calcCompleteness(parsed.data);

  try {
    await prisma.$transaction([
      prisma.recruitRole.deleteMany({ where: { recruitId } }),
      prisma.recruit.update({
        where: { id: recruitId },
        data: {
          type: parsed.data.type,
          title: parsed.data.title,
          content: parsed.data.content,
          techStack: parsed.data.techStack,
          problem: parsed.data.problem,
          targetUser: parsed.data.targetUser,
          coreFeatures: parsed.data.coreFeatures,
          reference: parsed.data.reference,
          completeness,
          roles: {
            create: parsed.data.roles.map((role) => ({ name: role.name, count: role.count })),
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("Update Recruit Error:", error);
    return { error: "모집 수정 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  updateTag(`recruit-${recruitId}`);
  revalidatePath("/recruit");
  revalidatePath("/dashboard");
  redirect(`/recruit/${recruitId}`);
}

export async function applyToRecruit(
  prevState: RecruitActionState,
  formData: FormData
): Promise<RecruitActionState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const recruitId = String(formData.get("recruitId") || "");
  if (!recruitId) {
    return { error: "잘못된 요청입니다." };
  }

  const parsed = applyToRecruitSchema.safeParse({
    message: formData.get("message") || undefined,
  });
  if (!parsed.success) {
    return { error: "입력값을 다시 확인해주세요." };
  }

  try {
    await prisma.application.create({
      data: {
        applicantId: user.id,
        recruitId,
        message: parsed.data.message,
      },
    });
  } catch (error) {
    console.error("Apply To Recruit Error:", error);
    return { error: "이미 지원했거나, 지원 처리 중 오류가 발생했습니다." };
  }

  updateTag(`recruit-${recruitId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

// 모집 작성자가 지원자를 수락/거절. 작성자 본인인지 서버에서 다시 확인.
export async function updateApplicationStatus(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const applicationId = String(formData.get("applicationId") || "");
  const status = String(formData.get("status") || "");

  if (status !== "ACCEPTED" && status !== "REJECTED") {
    return;
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { recruitId: true, recruit: { select: { authorId: true } } },
  });

  if (!application || application.recruit.authorId !== user.id) {
    redirect("/dashboard");
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  });

  revalidatePath(`/recruit/${application.recruitId}/applicants`);
  revalidatePath("/dashboard");
  // 폼이 이미 이 페이지(/recruit/[id]/applicants)에서 제출되므로 같은 경로로 redirect()하지
  // 않는다 — Server Action이 revalidatePath 직후 같은 경로로 redirect하면 클라이언트 라우터
  // 캐시가 안 지워져 수락/거절해도 화면이 그대로였다가 다른 페이지 갔다 와야 반영되는 문제가
  // 있었음(Next.js 이슈: https://github.com/vercel/next.js/issues/49450). redirect 없이 끝내면
  // Server Action 완료 후 Next가 알아서 현재 라우트를 새로고침한다.
}

// 상세 페이지 진입 시 호출 — ISR 캐시(getRecruitById)와 분리된 별도 mutation이라
// 매 조회마다 캐시를 무효화하지 않고도 조회수를 늘릴 수 있음. 최신 값을 바로 반환해서
// 페이지에서 캐시된 값 대신 이걸로 표시.
export async function incrementRecruitViewCount(recruitId: string): Promise<number> {
  try {
    const recruit = await prisma.recruit.update({
      where: { id: recruitId },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });
    return recruit.viewCount;
  } catch {
    return 0;
  }
}

// 저장(북마크) 토글. 폼이 아니라 버튼 클릭으로 바로 호출하는 형태라
// useActionState 대신 결과를 직접 반환.
export async function toggleRecruitBookmark(
  recruitId: string
): Promise<{ bookmarked: boolean; count: number } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "로그인이 필요합니다." };
  }

  // 클라이언트(BookmarkButton)가 낙관적 업데이트를 하기 때문에, 여기서 던지는 모든 예외를
  // {error}로 변환해줘야 함 — 안 그러면 실패해도 낙관적으로 뒤집힌 화면이 롤백 안 되고
  // 그대로 남아있다가 새로고침해야 진짜 상태(반영 안 됨)가 드러나는 버그가 생김.
  try {
    const existing = await prisma.recruitBookmark.findUnique({
      where: { userId_recruitId: { userId: user.id, recruitId } },
    });

    if (existing) {
      await prisma.recruitBookmark.delete({ where: { id: existing.id } });
    } else {
      await prisma.recruitBookmark.create({ data: { userId: user.id, recruitId } });
    }

    const count = await prisma.recruitBookmark.count({ where: { recruitId } });
    // getRecruitById는 ISR 캐시라 저장 개수(_count.bookmarks)가 다음 새로고침에도
    // 그대로 반영되려면 태그를 무효화해야 함 (지원 처리와 동일한 패턴).
    updateTag(`recruit-${recruitId}`);
    revalidatePath("/dashboard");
    return { bookmarked: !existing, count };
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    return { error: "저장 처리 중 오류가 발생했습니다." };
  }
}
