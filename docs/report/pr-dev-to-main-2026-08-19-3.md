## 개요

기술스택 프리셋 전환 기능 배포 반영. `dev`에서 PR #5로 검증되고 머지된 내용을 `main`(프로덕션)에 반영한다.

## 변경사항

- `config/tech-stack.ts` — 5개 카테고리(프론트엔드/백엔드/모바일/데이터·인프라/디자인기획) 26개 항목 프리셋 신설
- `TechStackInput` — 자유 텍스트 입력(Enter로 태그 추가)을 프리셋 뱃지 클릭 토글 방식으로 교체 ("React"/"React.js"/"ReactJS"처럼 같은 기술이 다른 태그로 쪼개지는 문제 방지)
- `TechStackUrlFilter`(모집 목록 필터)도 같은 프리셋을 공유하도록 통일
- `createRecruitSchema`에 프리셋 밖 값을 거부하는 `refine` 검증 추가 (클라이언트 우회 방지)

## 테스트

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run e2e` — 18 passed / 1 skipped / 0 failed
- PR #5 (feat → dev) CI(Lint & Typecheck) green 확인 후 머지된 상태
