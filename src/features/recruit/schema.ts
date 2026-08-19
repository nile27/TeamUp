import { z } from "zod";

export const recruitRoleSchema = z.object({
  name: z.string().min(1, "역할명을 입력해주세요."),
  count: z.number().int().min(1, "1명 이상이어야 해요."),
});

export const createRecruitSchema = z.object({
  type: z.enum(["DEV", "PLAN"], { message: "유형을 선택해주세요." }),
  title: z
    .string()
    .min(5, "제목을 입력해주세요.")
    .max(60, "제목은 60자 이하로 입력해주세요."),
  content: z.string().min(10, "설명을 조금 더 작성해주세요."),
  techStack: z.array(z.string()),
  roles: z.array(recruitRoleSchema).min(1, "최소 1개의 역할이 필요해요."),

  // 구조화 기획 폼 (선택) — 채운 정도로 완성도 계산
  problem: z.string().optional(),
  targetUser: z.string().optional(),
  coreFeatures: z.string().optional(),
  reference: z.string().optional(),
});

export type CreateRecruitInput = z.infer<typeof createRecruitSchema>;

export const applyToRecruitSchema = z.object({
  message: z.string().max(1000, "지원 메시지는 1000자 이하로 입력해주세요.").optional(),
});

export type ApplyToRecruitInput = z.infer<typeof applyToRecruitSchema>;
