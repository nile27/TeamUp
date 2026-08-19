## 개요

소셜 로그인(구글) 콜백 에러 처리 보강 배포 반영. `dev`에서 PR #7로 검증되고 머지된 내용을 `main`(프로덕션)에 반영한다.

## 변경사항

- 로그인 폼이 `/auth/callback`의 `error` 쿼리 파라미터를 안 읽어서, OAuth 실패 시 아무 메시지 없이 로그인 페이지로만 돌아가던 문제 수정
- 카카오는 비즈니스 채널 연동 전엔 이메일 동의항목을 못 받아 `email`이 빈 값으로 올 수 있음 — `User.email`이 `@unique`라 빈 문자열로 두 명 이상 가입 시 충돌하던 걸 auth id 기반 고유 이메일로 대체
- Supabase의 automatic identity linking이 예외적으로 실패해 Prisma email unique 충돌이 나는 경우, 조용히 실패해 "로그인은 됐는데 프로필 없는" 반쪽 상태로 남던 것을 방지 — 세션 정리 후 안내 메시지로 로그인 페이지에 돌려보냄
- Google OAuth Provider 설정 완료 및 실로그인 테스트 완료

## 테스트

- `npx tsc --noEmit`, `npm run build` 통과
- E2E(`auth.spec.ts`, `recruit-apply.spec.ts`) 통과
- 실제 구글 로그인 테스트: 기존 이메일 계정과 같은 Gmail로 로그인 → DB에서 같은 `user_id`에 `email`/`google` identity가 둘 다 연결된 것 확인 (중복 계정 안 생김)
- PR #7 (feat → dev) CI green 확인 후 머지된 상태

## 남은 것

- 카카오 로그인은 아직 Provider 설정/실테스트 전 (코드는 준비됨)
