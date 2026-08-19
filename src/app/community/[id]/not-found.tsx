import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

export default function CommunityPostNotFound() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">글을 찾을 수 없어요</h2>
        <p className="text-muted-foreground mb-6">삭제되었거나 존재하지 않는 글이에요.</p>
        <Button render={<Link href="/community" />} nativeButton={false}>
          목록으로 돌아가기
        </Button>
      </div>
    </AppShell>
  );
}
