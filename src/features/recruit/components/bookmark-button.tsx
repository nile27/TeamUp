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
    startTransition(async () => {
      const result = await toggleRecruitBookmark(recruitId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setBookmarked(result.bookmarked);
      setCount(result.count);
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
