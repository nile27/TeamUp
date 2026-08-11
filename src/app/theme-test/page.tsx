import { Button } from "@/components/ui/button";

// 테마 주입 확인용 임시 페이지. 앰버 primary / 먹색 텍스트 / Pretendard 확인 후 삭제 가능.
export default function ThemeTestPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-8 p-10">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground">
          TeamUp 테마 확인
        </h1>
        <p className="mt-1 text-muted-foreground">
          앰버 포인트 · 먹색 본문 · Pretendard 폰트가 잘 적용되는지 확인합니다.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">버튼</h2>
        <div className="flex flex-wrap gap-3">
          <Button>기본 (앰버)</Button>
          <Button variant="secondary">서브 (Amber Soft)</Button>
          <Button variant="outline">아웃라인</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="destructive">삭제</Button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">카드 · 뱃지</h2>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
              기획자 모집
            </span>
            <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
              모집중
            </span>
          </div>
          <p className="mt-3 text-card-foreground">
            흰 배경 + 옅은 테두리 카드. 그림자 없이 여백과 테두리로 구분.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">완성도 게이지</h2>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-2/3 rounded-full bg-primary" />
        </div>
      </section>
    </main>
  );
}
