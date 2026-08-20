## Summary
- PRD "Phase 2 이후"로 미뤄뒀던 글 수정 기능 추가 (커뮤니티 글, 모집글 둘 다)
- `CommunityForm`/`RecruitForm`을 optional `post`/`recruit` prop으로 생성·수정 겸용으로 리팩터링해 새 컴포넌트 없이 재사용
- `updatePost`, `updateRecruit` 서버 액션 추가. 둘 다 작성자 본인인지 서버에서 재확인 후 아니면 리다이렉트
- `updateRecruit`은 역할(역할명/인원) 배열을 통째 교체하는 방식(`deleteMany` + `create`, `$transaction`으로 원자성 보장)
- 상세 페이지(`/community/[id]`, `/recruit/[id]`)에 작성자에게만 보이는 "수정" 버튼 추가
- 모집 수정 폼은 ISR 캐시를 안 쓰는 별도 조회(`getRecruitForEdit`)로 항상 최신 값을 프리필

## Test plan
- [x] `npx tsc --noEmit`
- [x] `npx eslint`
- [x] `npm run build`
- [x] `npx playwright test` — 신규 케이스 2개(커뮤니티/모집 각각 작성→수정→반영 확인) 포함 전체 통과
  - 무관한 기존 테스트 1개(정식 모집 승격)가 4-worker 병렬 실행에서만 flake(단독 실행 시 통과, route announcer 텍스트 겹침 문제) — 이번 변경과 무관

🤖 Generated with [Claude Code](https://claude.com/claude-code)
