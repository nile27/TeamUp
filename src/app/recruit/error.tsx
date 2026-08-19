"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function RecruitError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-4xl mb-4">🚨</div>
        <h2 className="text-2xl font-bold text-[#2B2620] mb-2">데이터를 불러오는 중 오류가 발생했습니다</h2>
        <p className="text-muted-foreground mb-6">
          일시적인 문제일 수 있습니다. 다시 시도해 주세요.
        </p>
        <Button onClick={() => reset()} className="bg-[#FFA940] text-[#2B2620] hover:bg-[#F08C00]">
          다시 시도
        </Button>
      </div>
    </AppShell>
  );
}
