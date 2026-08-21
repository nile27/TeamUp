import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

// 라우트별 not-found.tsx(recruit/[id], community/[id])가 없는 모든 경로의 폴백.
export default function GlobalNotFound() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">페이지를 찾을 수 없어요</h2>
        <p className="text-muted-foreground mb-6">
          요청하신 주소가 삭제되었거나 잘못 입력됐을 수 있어요.
        </p>
        <div className="flex gap-3">
          <Button render={<Link href="/" />} nativeButton={false} variant="outline">
            홈으로 가기
          </Button>
          <Button render={<Link href="/recruit" />} nativeButton={false}>
            모집 둘러보기
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
