import { Badge } from "@/components/ui/badge";
import { TECH_STACK_CATEGORIES } from "@/config/tech-stack";

interface TechStackInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

// 자유 텍스트 대신 고정 프리셋에서만 고르게 해서 "React"/"React.js"/"ReactJS"처럼
// 같은 기술이 다른 태그로 쪼개지는 걸 원천 차단.
export function TechStackInput({ value, onChange }: TechStackInputProps) {
  const toggle = (stack: string) => {
    if (value.includes(stack)) {
      onChange(value.filter((v) => v !== stack));
    } else {
      onChange([...value, stack]);
    }
  };

  return (
    <div className="space-y-3">
      {TECH_STACK_CATEGORIES.map((category) => (
        <div key={category.label} className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">
            {category.label}
          </span>
          {category.items.map((stack) => {
            const selected = value.includes(stack);
            return (
              <Badge
                key={stack}
                onClick={() => toggle(stack)}
                variant={selected ? "default" : "outline"}
                className="cursor-pointer px-2.5 py-1 text-xs"
              >
                {stack}
              </Badge>
            );
          })}
        </div>
      ))}
    </div>
  );
}
