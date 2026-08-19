"use client";

import type { FieldErrors, UseFieldArrayReturn, UseFormRegister } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CreateRecruitInput } from "../schema";

interface RoleInputProps {
  register: UseFormRegister<CreateRecruitInput>;
  errors: FieldErrors<CreateRecruitInput>;
  fieldArray: UseFieldArrayReturn<CreateRecruitInput, "roles">;
}

export function RoleInput({ register, errors, fieldArray }: RoleInputProps) {
  const { fields, append, remove } = fieldArray;

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              placeholder="역할명 (예: 프론트엔드)"
              {...register(`roles.${index}.name` as const)}
            />
            {errors.roles?.[index]?.name && (
              <p className="text-sm text-destructive mt-1">{errors.roles[index]?.name?.message}</p>
            )}
          </div>
          <div className="w-24">
            <Input
              type="number"
              min={1}
              placeholder="인원"
              {...register(`roles.${index}.count` as const, { valueAsNumber: true })}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            disabled={fields.length <= 1}
            aria-label="역할 삭제"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {errors.roles?.message && (
        <p className="text-sm text-destructive">{errors.roles.message}</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: "", count: 1 })}
      >
        <Plus className="h-4 w-4" />
        역할 추가
      </Button>
    </div>
  );
}
