"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/server/supabase";
import { createRecruitSchema, applyToRecruitSchema } from "./schema";
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
  redirect(`/recruit/${application.recruitId}/applicants`);
}
