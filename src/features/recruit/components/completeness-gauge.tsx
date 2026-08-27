import { Progress } from "@/components/ui/progress";

interface CompletenessGaugeProps {
  value: number; // 0 to 100
  label?: string;
}

export function CompletenessGauge({ value, label = "기획 완성도" }: CompletenessGaugeProps) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold text-primary">{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
