import type { Metadata, Viewport } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

// Pretendard(한글)를 기본 sans로, Geist는 라틴 폴백 변수로 둔다.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TeamUp — 사이드프로젝트 팀원 매칭",
  description: "개발 못 해도 기획자로 참여하세요. 아이디어와 실행을 잇는 팀원 매칭 플랫폼.",
};

// 라이트 전용 디자인 — OS/브라우저 다크모드에서 자동 색 반전(force-dark)이 걸리지 않도록 명시.
// "light"만 쓰면 "선호는 라이트"라는 약한 신호라, 삼성 인터넷처럼 공격적인 다크모드 엔진이
// 일러스트(SVG의 짙은 아웃라인 색)를 여전히 반전시키는 문제가 있었음. "only light"는 CSS
// Color Adjustment 스펙상 더 강한 값 — "이 페이지는 다크 강제 조정 대상이 아님"을 명시해
// 이미지 반전까지 막는다.
export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      className={cn("h-full", "antialiased", geistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
