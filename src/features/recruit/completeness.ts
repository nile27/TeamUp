// 구조화 폼 4문항(problem/targetUser/coreFeatures/reference) 채운 정도 → 0~100.
// 강제 아님, 보상용 지표 (PRD 3.3). 각 문항 25점, 공백만 입력은 미채움으로 취급.
const FIELDS = ["problem", "targetUser", "coreFeatures", "reference"] as const;

export type CompletenessInput = Partial<Record<(typeof FIELDS)[number], string | null | undefined>>;

export function calcCompleteness(input: CompletenessInput): number {
  const filled = FIELDS.filter((field) => (input[field]?.trim().length ?? 0) > 0).length;
  return Math.round((filled / FIELDS.length) * 100);
}
