import { AppNav } from './app-nav';
import "@/styles/minimalist-pilot.css";

// minimalist-ui 스킬 파일럿 — AppShell을 쓰는 모든 페이지(랜딩 제외)에 일괄 적용.
// 스코프는 .minimalist-pilot 클래스 하나로, 토큰(--primary/--border 등)만 재정의해서
// 기존 컴포넌트 코드는 그대로 두고 색·테두리·그림자만 바뀐다.
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="minimalist-pilot relative flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1 w-full bg-background">
        {children}
      </main>
    </div>
  );
}
