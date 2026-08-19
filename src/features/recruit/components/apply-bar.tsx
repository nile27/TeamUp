"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { applyToRecruit } from "../actions";

interface ApplyBarProps {
  recruitId: string;
  isLoggedIn: boolean;
  isAuthor: boolean;
  alreadyApplied: boolean;
  isClosed: boolean;
  applicationCount: number;
}

export function ApplyBar({
  recruitId,
  isLoggedIn,
  isAuthor,
  alreadyApplied,
  isClosed,
  applicationCount,
}: ApplyBarProps) {
  const [state, formAction, isPending] = useActionState(applyToRecruit, null);
  const [isTransitioning, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const applied = alreadyApplied || !!state?.success;

  useEffect(() => {
    if (state?.success) {
      toast.success("지원이 완료되었습니다!");
    }
  }, [state]);

  const isLoading = isPending || isTransitioning;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("recruitId", recruitId);
    formData.append("message", message);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="sticky bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto max-w-4xl px-4 py-4">
        {isAuthor ? (
          <Button render={<Link href={`/recruit/${recruitId}/applicants`} />} nativeButton={false} className="w-full">
            지원자 확인하기 ({applicationCount})
          </Button>
        ) : !isLoggedIn ? (
          <Button render={<Link href="/login" />} nativeButton={false} className="w-full">
            로그인 후 지원하기
          </Button>
        ) : isClosed ? (
          <Button disabled className="w-full">모집이 마감되었어요</Button>
        ) : applied ? (
          <Button disabled className="w-full">지원 완료</Button>
        ) : (
          <form onSubmit={onSubmit} className="space-y-2">
            {state?.error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <div className="flex gap-2 items-end">
              <Textarea
                placeholder="지원 메시지 (선택)"
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
                className="min-h-9"
              />
              <Button type="submit" disabled={isLoading} className="shrink-0">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "지원하기"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
