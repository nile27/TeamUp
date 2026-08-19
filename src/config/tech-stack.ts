// 기술 스택 프리셋. 자유 텍스트 입력을 허용하면 "React"/"React.js"/"ReactJS"처럼
// 같은 기술이 다른 태그로 쪼개지는 문제가 있어서 고정 목록에서만 고르게 함.
export const TECH_STACK_CATEGORIES = [
  {
    label: "프론트엔드",
    items: ["React", "Next.js", "Vue.js", "TypeScript", "JavaScript", "Tailwind CSS"],
  },
  {
    label: "백엔드",
    items: ["Node.js", "Spring", "Django", "FastAPI", "Java", "Python"],
  },
  {
    label: "모바일",
    items: ["Flutter", "React Native", "Swift", "Kotlin"],
  },
  {
    label: "데이터/인프라",
    items: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Supabase", "AWS", "Docker"],
  },
  {
    label: "디자인/기획",
    items: ["Figma", "UI/UX"],
  },
] as const;

export const TECH_STACK_OPTIONS: string[] = TECH_STACK_CATEGORIES.flatMap((c) => c.items);
