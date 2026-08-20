## Summary
- 역할 기반 필터 보류 결정 기록 (문서만)
- 프로필 고도화: `User.portfolio`(마크다운) 필드, `/dashboard/edit` 프로필 수정 페이지, 마이페이지 표시 + 빈 상태 안내, 지원자 관리 페이지에서 포트폴리오 확인
- 불필요한 `"use client"` 지시어 정리 (`role-input.tsx`, `tech-stack-input.tsx`)
- E2E CI 자동화: `.github/workflows/e2e.yml`(매일 스케줄 + 수동 실행), `e2e/global.teardown.ts`(Auth 고아 계정 자동 정리 — 실계정으로 검증 완료, 87건 정리됨)

## Test plan
- [x] `npx tsc --noEmit`
- [x] `npx eslint`
- [x] `npm run build`
- [x] `npx playwright test` 전체 통과 (profile-edit 포함)
- [x] service_role 키로 teardown 스크립트 실제 실행 → Auth 고아 계정 정리 확인

🤖 Generated with [Claude Code](https://claude.com/claude-code)
