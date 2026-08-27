"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment } from "../actions";
import { avatarTone } from "@/lib/avatar-tone";

export interface CommentItem {
  id: string;
  content: string;
  createdAt: string;
  author: { nickname: string };
}

interface CommentListProps {
  postId: string;
  comments: CommentItem[];
  isLoggedIn: boolean;
}

export function CommentList({ postId, comments, isLoggedIn }: CommentListProps) {
  const [state, formAction, isPending] = useActionState(createComment, null);
  const [isTransitioning, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  const isLoading = isPending || isTransitioning;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">댓글 {comments.length}</h2>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">첫 댓글을 남겨보세요.</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3 border-b pb-4 last:border-b-0">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarTone(comment.author.nickname)}`}
              >
                {comment.author.nickname.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <span className="font-medium text-foreground">{comment.author.nickname}</span>
                  <span className="text-muted-foreground text-xs">{comment.createdAt}</span>
                </div>
                <p className="text-[15px] text-foreground whitespace-pre-wrap">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isLoggedIn ? (
        <form ref={formRef} onSubmit={onSubmit} className="space-y-2 pt-2">
          <input type="hidden" name="postId" value={postId} />
          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Textarea name="content" placeholder="댓글을 입력해주세요" rows={2} disabled={isLoading} />
          <Button type="submit" size="sm" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "댓글 등록"}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground pt-2">댓글을 남기려면 로그인해주세요.</p>
      )}
    </div>
  );
}
