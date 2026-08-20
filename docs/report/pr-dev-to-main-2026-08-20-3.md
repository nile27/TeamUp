## Summary
- 글 수정 페이지 추가 — 모집글(`/recruit/[id]/edit`), 커뮤니티 글(`/community/[id]/edit`) 둘 다 작성자만 접근 가능. 기존 `RecruitForm`/`CommunityForm`을 생성·수정 겸용으로 리팩터링해 재사용. 상세 페이지에 작성자 전용 "수정" 버튼 추가.
- 버그 수정: 커뮤니티 글을 정식 모집으로 승격(`promoteToRecruit`)할 때 검증 없이 그대로 저장돼, 짧은 글(제목 5자/소개 10자 미만)도 모집글이 되고 이후 수정 시 저장이 막히던 문제 — 승격 시점에 모집 스키마로 미리 검증하도록 수정

## Test plan
- [x] `npx tsc --noEmit`
- [x] `npx eslint`
- [x] `npm run build`
- [x] `npx playwright test` 전체 통과
- [x] 실 계정으로 승격 버그 재현 후 수정 검증

🤖 Generated with [Claude Code](https://claude.com/claude-code)
