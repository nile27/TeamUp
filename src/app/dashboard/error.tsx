"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@/styles/minimalist-pilot.css";

// error.tsx는 Client Component 경계라 AppShell(서버에서 auth 조회하는 AppNav 포함)을
// 쓸 수 없음 — next/headers를 client 번들에 포함시키려 하면 빌드가 깨짐.
// AppShell을 못 쓰니 minimalist-pilot 스코프도 직접 붙여야 다른 페이지와 톤이 맞음.
export default function DashboardError({
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
    <div className="minimalist-pilot min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary">
        <TriangleAlert className="size-6 text-secondary-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">마이페이지를 불러오는 중 오류가 발생했습니다</h2>
      <p className="text-muted-foreground mb-6">일시적인 문제일 수 있습니다. 다시 시도해 주세요.</p>
      <Button onClick={() => reset()}>다시 시도</Button>
    </div>
  );
}
