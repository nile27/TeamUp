"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// error.tsx는 Client Component 경계라 AppShell(서버에서 auth 조회하는 AppNav 포함)을
// 쓸 수 없음 — next/headers를 client 번들에 포함시키려 하면 빌드가 깨짐(recruit/community/dashboard
// error.tsx와 동일한 제약). 이 파일은 그 라우트들 밖(예: /theme-test, 예상 못한 곳)의 폴백.
export default function GlobalError({
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
      <h2 className="text-2xl font-bold text-foreground mb-2">문제가 발생했어요</h2>
      <p className="text-muted-foreground mb-6">
        일시적인 오류일 수 있어요. 다시 시도해 주세요.
      </p>
      <div className="flex gap-3">
        <Button render={<Link href="/" />} nativeButton={false} variant="outline">
          홈으로 가기
        </Button>
        <Button onClick={() => reset()}>다시 시도</Button>
      </div>
    </div>
  );
}
