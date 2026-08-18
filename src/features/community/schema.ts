import { z } from "zod";

export const createPostSchema = z.object({
  tag: z.enum(["IDEA", "QUESTION", "ETC"], { message: "말머리를 선택해주세요." }),
  title: z.string().min(1, "제목을 입력해주세요.").max(100, "제목은 100자 이하로 입력해주세요."),
  content: z.string().min(1, "내용을 입력해주세요."),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1, "댓글을 입력해주세요."),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
