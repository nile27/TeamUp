import { z } from "zod";

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, "닉네임은 2자 이상이어야 합니다.")
    .max(20, "닉네임은 20자 이하이어야 합니다."),
  bio: z.string().max(200, "자기소개는 200자 이하로 입력해주세요.").optional(),
  portfolio: z.string().max(5000, "포트폴리오는 5000자 이하로 입력해주세요.").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
