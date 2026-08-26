"use client";

import { useRef, useState, useTransition } from "react";
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
  // isPending은 React가 렌더링을 커밋한 뒤에야 true가 되는데, 그 전 짧은 순간에 연타하면
  // disabled 속성이 아직 안 걸린 채로 여러 요청이 동시에 나감 — 서버의 toggle 로직이
  // "있으면 삭제, 없으면 생성"이라 두 요청이 동시에 "없음"을 보면 둘 다 생성을 시도해
  // unique 제약 위반으로 하나가 실패하고, 그 롤백이 잘못된 이전 상태로 되돌리는 문제가
  // 있었음(연타 시 하트가 엉뚱하게 0으로 바뀌는 버그). ref는 렌더링과 무관하게 즉시
  // 갱신되니 이걸로 동시 요청 자체를 막는다.
  const isMutatingRef = useRef(false);

  if (!isLoggedIn) {
    return (
      <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="sm">
        <Bookmark className="h-4 w-4" />
        저장 ({count})
      </Button>
    );
  }

  const onClick = () => {
    if (isMutatingRef.current) return;
    isMutatingRef.current = true;

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
      } finally {
        isMutatingRef.current = false;
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
