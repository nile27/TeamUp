import type { FieldErrors, UseFormRegister } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateRecruitInput } from "../schema";

const QUESTIONS: {
  name: "problem" | "targetUser" | "coreFeatures" | "reference";
  label: string;
  placeholder: string;
}[] = [
  {
    name: "problem",
    label: "어떤 문제를 겪었나요?",
    placeholder: "예: 사이드프로젝트를 하고 싶은데 같이 만들 사람을 찾기 어려웠어요.",
  },
  {
    name: "targetUser",
    label: "누가 어떤 상황에 쓰나요?",
    placeholder: "예: 아이디어는 있지만 개발을 못 하는 예비 창업자.",
  },
  {
    name: "coreFeatures",
    label: "꼭 필요한 기능 3가지는?",
    placeholder: "예: 1) 팀원 매칭 2) 모집글 작성 3) 지원/수락 흐름",
  },
  {
    name: "reference",
    label: "비슷한 앱/사이트가 있다면?",
    placeholder: "예: https://...",
  },
];

interface StructuredFormProps {
  register: UseFormRegister<CreateRecruitInput>;
  errors: FieldErrors<CreateRecruitInput>;
}

export function StructuredForm({ register, errors }: StructuredFormProps) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">기획 정보 (선택)</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          답하는 만큼 기획 문서가 되고, 완성도가 올라갑니다.
        </p>
      </div>
      {QUESTIONS.map((q) => (
        <div key={q.name} className="space-y-2">
          <Label htmlFor={q.name}>{q.label}</Label>
          <Textarea id={q.name} placeholder={q.placeholder} rows={3} {...register(q.name)} />
          {errors[q.name] && (
            <p className="text-sm text-destructive">{errors[q.name]?.message}</p>
          )}
        </div>
      ))}
    </div>
  );
}
