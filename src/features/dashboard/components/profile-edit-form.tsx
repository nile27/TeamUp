"use client";

import { useActionState, useEffect, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfileSchema, type UpdateProfileInput } from "../schema";
import { updateProfile } from "../actions";
import { MarkdownEditor } from "./markdown-editor";

interface ProfileEditFormProps {
  defaultValues: {
    nickname: string;
    bio: string;
    portfolio: string;
  };
}

export function ProfileEditForm({ defaultValues }: ProfileEditFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, null);
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    if (state?.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([key, message]) => {
        setError(key as keyof UpdateProfileInput, { type: "server", message });
      });
    }
  }, [state, setError]);

  const isLoading = isPending || isTransitioning;

  const onSubmit = (data: UpdateProfileInput) => {
    const formData = new FormData();
    formData.append("nickname", data.nickname);
    formData.append("bio", data.bio ?? "");
    formData.append("portfolio", data.portfolio ?? "");
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {state?.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="nickname">닉네임</Label>
        <Input id="nickname" {...register("nickname")} disabled={isLoading} />
        {errors.nickname && <p className="text-sm text-destructive">{errors.nickname.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">한 줄 자기소개</Label>
        <Textarea id="bio" rows={2} placeholder="어떤 걸 하는 사람인지 짧게 소개해주세요" {...register("bio")} disabled={isLoading} />
        {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="portfolio">포트폴리오 · 경력</Label>
        <Controller
          control={control}
          name="portfolio"
          render={({ field }) => (
            <MarkdownEditor
              id="portfolio"
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder={"예:\n## 프로젝트\n- OO 서비스 프론트엔드 개발 (2025)\n\n## 링크\n- [깃허브](https://github.com/...)"}
            />
          )}
        />
        {errors.portfolio && <p className="text-sm text-destructive">{errors.portfolio.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            저장 중...
          </>
        ) : (
          "저장하기"
        )}
      </Button>
    </form>
  );
}
