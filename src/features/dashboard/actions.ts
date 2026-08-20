"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db";
import { createClient } from "@/server/supabase";
import { updateProfileSchema } from "./schema";

export type UpdateProfileState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

export async function updateProfile(
  prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateProfileSchema.safeParse({
    nickname: raw.nickname,
    bio: raw.bio || undefined,
    portfolio: raw.portfolio || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      if (issue.path[0] !== undefined) fieldErrors[String(issue.path[0])] = issue.message;
    });
    return { error: "입력값을 다시 확인해주세요.", fieldErrors };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        nickname: parsed.data.nickname,
        bio: parsed.data.bio ?? null,
        portfolio: parsed.data.portfolio ?? null,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "프로필 저장 중 오류가 발생했습니다. 다시 시도해주세요." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
