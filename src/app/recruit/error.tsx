"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// error.tsx는 Client Component 경계라 AppShell(서버에서 auth 조회하는 AppNav 포함)을
// 쓸 수 없음 — next/headers를 client 번들에 포함시키려 하면 빌드가 깨짐.
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="text-4xl mb-4">🚨</div>
      <h2 className="text-2xl font-bold text-foreground mb-2">데이터를 불러오는 중 오류가 발생했습니다</h2>
      <p className="text-muted-foreground mb-6">
        일시적인 문제일 수 있습니다. 다시 시도해 주세요.
      </p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </div>
  );
}
