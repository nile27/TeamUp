"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleRecruitBookmark } from "../actions";

interface BookmarkButtonProps {
  recruitId: string;
  isLoggedIn: boolean;
  initialBookmarked: boolean;
  initialCount: number;
}

export function BookmarkButton({ recruitId, isLoggedIn, initialBookmarked, initialCount }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="sm">
        <Bookmark className="h-4 w-4" />
        저장 ({count})
      </Button>
    );
  }

  const onClick = () => {
    const prevBookmarked = bookmarked;
    const prevCount = count;
    // 낙관적 업데이트 — 서버 응답 기다리지 않고 클릭 즉시 반영, 실패하면 롤백.
    setBookmarked(!prevBookmarked);
    setCount(prevCount + (prevBookmarked ? -1 : 1));

    startTransition(async () => {
      try {
        const result = await toggleRecruitBookmark(recruitId);
        if ("error" in result) {
          setBookmarked(prevBookmarked);
          setCount(prevCount);
          toast.error(result.error);
          return;
        }
        setBookmarked(result.bookmarked);
        setCount(result.count);
      } catch {
        // Server Action 호출 자체가 실패한 경우(네트워크 등) — actions.ts는 내부 예외를
        // {error}로 변환하지만, 혹시 모를 프레임워크 레벨 실패까지 대비해 여기서도 롤백.
        setBookmarked(prevBookmarked);
        setCount(prevCount);
        toast.error("저장 처리 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      variant={bookmarked ? "default" : "outline"}
      size="sm"
    >
      <Bookmark className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`} />
      {bookmarked ? "저장됨" : "저장"} ({count})
    </Button>
  );
}
