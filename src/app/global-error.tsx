"use client";

import { useEffect } from "react";
import "./globals.css";
import "@/styles/minimalist-pilot.css";

// 루트 레이아웃(layout.tsx) 자체가 렌더링 중 터졌을 때만 쓰이는 최상위 바운더리.
// error.tsx는 이 경우를 못 잡음 — layout.tsx보다 위에 있어야 해서 자체 <html><body>를
// 포함해야 함(정상 RootLayout의 폰트·Provider는 못 씀. globals.css의 테마 변수만 재사용).
// 아이콘도 lucide-react 대신 인라인 SVG — 이 파일은 최후의 폴백이라 의존성을 진짜 최소로 유지.
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
      <body className="minimalist-pilot min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center antialiased">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-secondary">
          <svg
            className="size-6 text-secondary-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>
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
