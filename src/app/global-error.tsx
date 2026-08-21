"use client";

import { useEffect } from "react";
import "./globals.css";

// 루트 레이아웃(layout.tsx) 자체가 렌더링 중 터졌을 때만 쓰이는 최상위 바운더리.
// error.tsx는 이 경우를 못 잡음 — layout.tsx보다 위에 있어야 해서 자체 <html><body>를
// 포함해야 함(정상 RootLayout의 폰트·Provider는 못 씀. globals.css의 테마 변수만 재사용).
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
    <html lang="ko">
      <body className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center antialiased">
        <div className="text-4xl mb-4">🚨</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">문제가 발생했어요</h2>
        <p className="text-muted-foreground mb-6">
          페이지를 불러오는 중 예상치 못한 오류가 발생했어요. 새로고침해 주세요.
        </p>
        {/* shadcn Button(@base-ui/react 의존)이 아니라 순수 button — 최상위 폴백은 의존성을 최소로 유지 */}
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
        >
          새로고침
        </button>
      </body>
    </html>
  );
}
