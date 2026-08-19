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
    startTransition(async () => {
      const result = await toggleCommunityPostLike(postId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setLiked(result.liked);
      setCount(result.count);
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
