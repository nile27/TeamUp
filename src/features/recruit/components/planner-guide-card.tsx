import { Sparkles } from "lucide-react";

export function PlannerGuideCard() {
  return (
    <div className="flex gap-3 rounded-xl border border-secondary bg-secondary/60 p-4">
      <Sparkles className="h-5 w-5 shrink-0 text-primary" />
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">기획자로 참여하시나요?</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          아이디어만 던지고 끝이 아닙니다. 문서화·의사결정·QA로 함께해주세요.
          그럼 기획 포트폴리오가 남습니다.
        </p>
      </div>
    </div>
  );
}
