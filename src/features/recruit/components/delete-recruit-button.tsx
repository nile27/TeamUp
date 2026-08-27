"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteRecruit } from "../actions";

export function DeleteRecruitButton({ recruitId }: { recruitId: string }) {
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    if (!confirm("이 모집글을 삭제할까요? 지원 내역을 포함해 되돌릴 수 없습니다.")) return;
    // deleteRecruit은 성공 시 redirect()로 끝나는데, redirect()는 Next.js가 내부적으로
    // 던지는 특수 예외로 흐름을 제어하는 방식이라 여기서 try/catch로 감싸면 안 됨
    // (감싸면 정상적인 redirect까지 실패로 잡혀버림). 실제 DB 오류는 error.tsx가 처리.
    startTransition(() => {
      deleteRecruit(recruitId);
    });
  };

  return (
    <Button onClick={onClick} disabled={isPending} variant="destructive" size="sm">
      삭제
    </Button>
  );
}
