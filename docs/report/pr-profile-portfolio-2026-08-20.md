## Summary
- 프로필 고도화: `User.portfolio`(마크다운) 필드 추가, `/dashboard/edit` 프로필 수정 페이지, 마이페이지에 포트폴리오 표시
- 포트폴리오 미작성 시 빈 상태 안내(입력 유도) 추가
- 지원자 관리 페이지에서 지원자 포트폴리오 확인 가능 (`<details>` 토글)
- 불필요한 `"use client"` 지시어 정리 (`role-input.tsx`, `tech-stack-input.tsx`)

## Test plan
- [x] `npx tsc --noEmit`
- [x] `npx eslint` (관련 경로)
- [x] `npm run build`
- [x] `npx playwright test` — profile-edit 스펙 포함 전체 통과
- [x] 수동 확인: 작성/미리보기 탭 전환, 저장 후 마이페이지 반영, 지원자 포트폴리오 노출, 포트폴리오 미작성 빈 상태 UI

🤖 Generated with [Claude Code](https://claude.com/claude-code)
