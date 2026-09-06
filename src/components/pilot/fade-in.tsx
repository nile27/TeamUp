"use client";

import { useEffect, useRef, useState } from "react";

// minimalist-ui 스킬 파일럿 전용 — IntersectionObserver 기반 스크롤 진입 페이드.
// window scroll 이벤트 대신 옵저버를 쓰라는 스킬 지침(6장) 그대로 따름.
export function FadeIn({ index = 0, children }: { index?: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`pilot-fade-in ${visible ? "pilot-fade-in-visible" : ""}`}
      style={{ transitionDelay: `${Math.min(index, 8) * 80}ms` }}
    >
      {children}
    </div>
  );
}
