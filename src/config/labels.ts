import type { CommunityTag, RecruitType } from "@prisma/client";

// "이 모집이 찾는 사람"을 뜻함 (모집을 올린 사람의 직군이 아님).
// "OO 모집"은 누가 누구를 찾는지 헷갈린다는 피드백으로 "OO 구해요"로 변경.
export const RECRUIT_TYPE_LABEL: Record<RecruitType, string> = {
  DEV: "개발자 구해요",
  PLAN: "기획자 구해요",
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
