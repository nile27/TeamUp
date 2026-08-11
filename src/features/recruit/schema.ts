import { z } from "zod";

export const createRecruitSchema = z.object({
  type: z.enum(["DEV", "PLAN"]),
  title: z.string().min(2, "제목은 2자 이상 입력해주세요."),
  content: z.string().min(10, "상세 내용은 10자 이상 입력해주세요."),
  techStack: z.array(z.string()).default([]),
  
  // 기획 정보 (선택)
  problem: z.string().optional(),
  targetUser: z.string().optional(),
  coreFeatures: z.string().optional(),
  reference: z.string().optional(),
});

export type CreateRecruitInput = z.infer<typeof createRecruitSchema>;
