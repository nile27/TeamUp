## 개요

기술스택 입력을 자유 텍스트에서 고정 프리셋으로 전환. 자유 텍스트 입력이 "React"/"React.js"/"ReactJS"처럼 같은 기술이 다른 태그로 쪼개지는 문제가 있어서, 고정 프리셋에서만 클릭으로 고르도록 바꿨다.

## 변경사항

- `config/tech-stack.ts` — 5개 카테고리(프론트엔드/백엔드/모바일/데이터·인프라/디자인기획) 26개 항목 프리셋 신설
- `TechStackInput` — Enter로 추가하던 자유 텍스트 방식을 프리셋 뱃지 클릭 토글 방식으로 교체
- `TechStackUrlFilter`(모집 목록 필터)도 같은 프리셋을 공유하도록 통일 (기존엔 9개짜리 별도 목록이었음)
- `createRecruitSchema`에 프리셋 밖 값을 거부하는 `refine` 검증 추가 (클라이언트 우회 방지)

## 테스트

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run e2e` — 18 passed / 1 skipped / 0 failed (`recruit-create.spec.ts`를 프리셋 클릭 방식으로 갱신)
