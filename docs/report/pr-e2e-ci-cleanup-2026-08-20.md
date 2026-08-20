## Summary
- E2E를 CI에서 정기적으로(매일 스케줄, 수동 실행도 가능) 돌리도록 `.github/workflows/e2e.yml` 추가
- `e2e/global.teardown.ts`: Playwright 전체 테스트 종료 후 `teamup.e2e.*` 이메일 계정을 Prisma `User`(cascade)와 Supabase Auth 양쪽에서 자동 정리. `SUPABASE_SERVICE_ROLE_KEY` 없으면 (로컬 개발 등) 안전하게 스킵
- `.env.example`에 `SUPABASE_SERVICE_ROLE_KEY` 안내 추가

## 배포 전 필요한 작업 (사용자가 직접)
GitHub repo → Settings → Secrets and variables → Actions 에 아래 등록 필요:
- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase 대시보드 → Project Settings → API → service_role)

등록 전까지는 `e2e.yml` 워크플로가 스케줄/수동 실행 시 실패합니다 (PR 체크에는 영향 없음 — push/pull_request 트리거가 아니라 schedule/workflow_dispatch만 사용).

## Test plan
- [x] `npx tsc --noEmit`
- [x] `npx eslint` (변경 파일)
- [x] `npm run build`
- [ ] 실제 스케줄 실행 확인은 Secrets 등록 후 `workflow_dispatch`로 수동 트리거해 확인 필요

🤖 Generated with [Claude Code](https://claude.com/claude-code)
