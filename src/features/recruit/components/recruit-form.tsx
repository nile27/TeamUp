"use client";

import { useActionState, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createRecruitSchema, type CreateRecruitInput } from "../schema";
import { createRecruit, updateRecruit } from "../actions";
import { calcCompleteness } from "../completeness";
import { PlannerGuideCard } from "./planner-guide-card";
import { StructuredForm } from "./structured-form";
import { RoleInput } from "./role-input";
import { TechStackInput } from "./tech-stack-input";
import { CompletenessGauge } from "./completeness-gauge";
import { RECRUIT_TYPE_LABEL } from "@/config/labels";

interface RecruitFormProps {
  recruit?: { id: string } & CreateRecruitInput;
}

export function RecruitForm({ recruit }: RecruitFormProps) {
  const isEdit = !!recruit;
  const [state, formAction, isPending] = useActionState(isEdit ? updateRecruit : createRecruit, null);
  const [isTransitioning, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    formState: { errors },
  } = useForm<CreateRecruitInput>({
    resolver: zodResolver(createRecruitSchema),
    defaultValues: recruit ?? {
      type: "DEV",
      title: "",
      content: "",
      techStack: [],
      roles: [{ name: "", count: 1 }],
      problem: "",
      targetUser: "",
      coreFeatures: "",
      reference: "",
    },
    mode: "onBlur",
  });

  const fieldArray = useFieldArray({ control, name: "roles" });
  const structuredFields = watch(["problem", "targetUser", "coreFeatures", "reference"]);
  const completeness = calcCompleteness({
    problem: structuredFields[0],
    targetUser: structuredFields[1],
    coreFeatures: structuredFields[2],
    reference: structuredFields[3],
  });

  const isLoading = isPending || isTransitioning;

  const onSubmit = (data: CreateRecruitInput) => {
    const formData = new FormData();
    if (recruit) formData.append("recruitId", recruit.id);
    formData.append("type", data.type);
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("techStack", JSON.stringify(data.techStack));
    formData.append("roles", JSON.stringify(data.roles));
    if (data.problem) formData.append("problem", data.problem);
    if (data.targetUser) formData.append("targetUser", data.targetUser);
    if (data.coreFeatures) formData.append("coreFeatures", data.coreFeatures);
    if (data.reference) formData.append("reference", data.reference);

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => {
        if (state?.fieldErrors) {
          Object.entries(state.fieldErrors).forEach(([key, message]) => {
            setError(key as keyof CreateRecruitInput, { type: "server", message });
          });
        }
      })}
      className="space-y-8"
    >
      <PlannerGuideCard />

      {state?.error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <div className="space-y-2">
        <Label>모집 유형</Label>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <div className="flex gap-2">
              {(["DEV", "PLAN"] as const).map((type) => (
                <Badge
                  key={type}
                  data-testid={`recruit-type-${type}`}
                  onClick={() => field.onChange(type)}
                  variant={field.value === type ? "default" : "outline"}
                  className="cursor-pointer px-4 py-1.5 text-sm"
                >
                  {RECRUIT_TYPE_LABEL[type]}
                </Badge>
              ))}
            </div>
          )}
        />
        {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">제목</Label>
        <Input id="title" placeholder="모집글 제목을 입력해주세요" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">소개</Label>
        <Textarea id="content" rows={5} placeholder="프로젝트를 소개해주세요" {...register("content")} />
        {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>필요한 역할</Label>
        <RoleInput register={register} errors={errors} fieldArray={fieldArray} />
      </div>

      <div className="space-y-2">
        <Label>기술 스택 (선택)</Label>
        <Controller
          control={control}
          name="techStack"
          render={({ field }) => <TechStackInput value={field.value} onChange={field.onChange} />}
        />
      </div>

      <Separator />

      <div className="space-y-4">
        <CompletenessGauge value={completeness} />
        <StructuredForm register={register} errors={errors} />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isEdit ? "수정 중..." : "등록 중..."}
          </>
        ) : isEdit ? (
          "모집글 수정하기"
        ) : (
          "모집글 등록하기"
        )}
      </Button>
    </form>
  );
}
