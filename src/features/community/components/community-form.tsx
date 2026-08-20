"use client";

import { useActionState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPostSchema, type CreatePostInput } from "../schema";
import { createPost, updatePost } from "../actions";
import { COMMUNITY_TAG_LABEL } from "@/config/labels";

const TAG_OPTIONS = (["IDEA", "QUESTION", "ETC"] as const).map((value) => ({
  value,
  label: COMMUNITY_TAG_LABEL[value],
}));

interface CommunityFormProps {
  post?: { id: string; tag: CreatePostInput["tag"]; title: string; content: string };
}

export function CommunityForm({ post }: CommunityFormProps) {
  const isEdit = !!post;
  const [state, formAction, isPending] = useActionState(isEdit ? updatePost : createPost, null);
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: post ?? { tag: "IDEA", title: "", content: "" },
    mode: "onBlur",
  });

  const isLoading = isPending || isTransitioning;

  const onSubmit = (data: CreatePostInput) => {
    const formData = new FormData();
    if (post) formData.append("postId", post.id);
    formData.append("tag", data.tag);
    formData.append("title", data.title);
    formData.append("content", data.content);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        if (state?.fieldErrors) {
          Object.entries(state.fieldErrors).forEach(([key, message]) => {
            setError(key as keyof CreatePostInput, { type: "server", message });
          });
        }
      })}
      className="space-y-5"
    >
      {state?.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label>말머리</Label>
        <Controller
          control={control}
          name="tag"
          render={({ field }) => (
            <div className="flex gap-2">
              {TAG_OPTIONS.map((opt) => (
                <Badge
                  key={opt.value}
                  data-testid={`community-tag-${opt.value}`}
                  onClick={() => field.onChange(opt.value)}
                  variant={field.value === opt.value ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1.5 text-sm"
                >
                  {opt.label}
                </Badge>
              ))}
            </div>
          )}
        />
        {errors.tag && <p className="text-sm text-destructive">{errors.tag.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" placeholder="제목을 입력해주세요" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">내용</Label>
        <Textarea id="content" rows={8} placeholder="내용을 입력해주세요" {...register("content")} />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEdit ? "수정 중..." : "등록 중..."}
          </>
        ) : isEdit ? (
          "수정하기"
        ) : (
          "등록하기"
        )}
      </Button>
    </form>
  );
}
