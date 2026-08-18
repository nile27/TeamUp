import type { CommunityTag, RecruitType } from "@prisma/client";

export const RECRUIT_TYPE_LABEL: Record<RecruitType, string> = {
  DEV: "개발자 모집",
  PLAN: "기획자 모집",
};

export const COMMUNITY_TAG_LABEL: Record<CommunityTag, string> = {
  IDEA: "아이디어",
  QUESTION: "질문",
  ETC: "기타",
};

export const COMMUNITY_TAG_FILTERS: { value: CommunityTag | "ALL"; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "IDEA", label: "아이디어" },
  { value: "QUESTION", label: "질문" },
  { value: "ETC", label: "기타" },
];
