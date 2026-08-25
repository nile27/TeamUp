"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleCommunityPostLike } from "../actions";

interface LikeButtonProps {
  postId: string;
  isLoggedIn: boolean;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({ postId, isLoggedIn, initialLiked, initialCount }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="sm">
        <ThumbsUp className="h-4 w-4" />
        좋아요 ({count})
      </Button>
    );
  }

  const onClick = () => {
    const prevLiked = liked;
    const prevCount = count;
    // 낙관적 업데이트 — 서버 응답 기다리지 않고 클릭 즉시 반영, 실패하면 롤백.
    setLiked(!prevLiked);
    setCount(prevCount + (prevLiked ? -1 : 1));

    startTransition(async () => {
      try {
        const result = await toggleCommunityPostLike(postId);
        if ("error" in result) {
          setLiked(prevLiked);
          setCount(prevCount);
          toast.error(result.error);
          return;
        }
        setLiked(result.liked);
        setCount(result.count);
      } catch {
        // Server Action 호출 자체가 실패한 경우(네트워크 등) — actions.ts는 내부 예외를
        // {error}로 변환하지만, 혹시 모를 프레임워크 레벨 실패까지 대비해 여기서도 롤백.
        setLiked(prevLiked);
        setCount(prevCount);
        toast.error("좋아요 처리 중 오류가 발생했습니다.");
      }
    });
  };

  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      variant={liked ? "default" : "outline"}
      size="sm"
    >
      <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      {liked ? "좋아요 취소" : "좋아요"} ({count})
    </Button>
  );
}
