"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useRef } from "react";
import { TECH_STACK_OPTIONS } from "@/config/tech-stack";

export function TechStackUrlFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const currentStacks = searchParams.get("stack")?.split(",").filter(Boolean) || [];

  const toggleStack = useCallback((stack: string) => {
    const newStacks = currentStacks.includes(stack)
      ? currentStacks.filter(s => s !== stack)
      : [...currentStacks, stack];

    const params = new URLSearchParams(searchParams.toString());
    if (newStacks.length > 0) {
      params.set("stack", newStacks.join(","));
    } else {
      params.delete("stack");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [currentStacks, pathname, router, searchParams]);

  const scrollBy = (dx: number) => scrollerRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  const resetFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("stack");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-sm font-semibold text-foreground">
          기술 스택으로 필터링 <span className="text-muted-foreground font-normal">({TECH_STACK_OPTIONS.length})</span>
        </h2>
        {currentStacks.length > 0 && (
          <button
            type="button"
            onClick={resetFilter}
            className="text-xs font-medium text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            필터 초기화 ({currentStacks.length})
          </button>
        )}
      </div>

      <div className="relative">
        {/* 좌우 화살표 — 캐러셀 양 끝에 오버레이. 페이드 영역만큼 스크롤 콘텐츠에 여백을 줘서
            첫/마지막 뱃지가 화살표·페이드에 가려 잘려 보이지 않게 함. */}
        <button
          type="button"
          onClick={() => scrollBy(-240)}
          aria-label="이전"
          className="absolute left-0 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(240)}
          aria-label="다음"
          className="absolute right-0 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-sm hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent z-10" />

        <div
          ref={scrollerRef}
          data-testid="tech-stack-filter"
          className="flex gap-2 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-10 py-1"
        >
          {TECH_STACK_OPTIONS.map(stack => {
            const isActive = currentStacks.includes(stack);
            return (
              <Badge
                key={stack}
                variant={isActive ? "default" : "outline"}
                className={`cursor-pointer transition-colors px-3 py-1 shrink-0 ${
                  isActive
                    ? 'border-transparent'
                    : 'bg-card hover:bg-muted text-muted-foreground border-border'
                }`}
                onClick={() => toggleStack(stack)}
              >
                {stack}
              </Badge>
            );
          })}
        </div>
      </div>
    </div>
  );
}
