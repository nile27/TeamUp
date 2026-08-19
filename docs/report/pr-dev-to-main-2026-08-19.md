# PR: dev → main — TeamUp MVP 전 화면 구현 + 버그 수정

## 개요

인증부터 모집/커뮤니티/대시보드까지 MVP 10개 페이지 전체 구현, Playwright E2E 세팅, 화면 채우기용 시드 데이터, 그리고 실사용 중 발견한 버그 다수 수정까지 포함하는 대규모 병합입니다. `main`은 초기 랜딩/공용 컴포넌트 단계에서 멈춰있고, 그 이후 모든 작업은 `dev`에서 진행됐습니다.

## 주요 변경사항

### 인증 (features/auth)
- 이메일 회원가입/로그인, 소셜 로그인 버튼(구글/카카오 — Provider 설정은 보류)
- 로그인 후 헤더 상태 미반영, 토스트→인라인 배너 통일, Supabase 이메일 열거 방지로 인한 중복 이메일 미검출, 회원가입 비밀번호 복잡도 검증 등 버그 수정

### 모집 (features/recruit) ★핵심
- `/recruit/new` — 기획자 3종 장치(가이드 카드·구조화 폼·완성도 게이지) + 역할/기술스택 입력
- `/recruit/[id]` — ISR(`unstable_cache` + `updateTag`), 지원 기능(`ApplyBar`, 중복 지원 방지)
- `/recruit/[id]/applicants` — **지원자 관리(신규)**: 작성자가 지원자 확인 + 수락/거절, 지원자는 마이페이지에서 결과 확인
- 완성도 게이지가 값과 무관하게 항상 꽉 차 보이던 CSS 버그 수정
- 모집 유형 라벨 "OO 모집" → "OO 구해요"로 변경 (누가 누구를 찾는지 헷갈린다는 피드백)

### 커뮤니티 (features/community)
- 목록(말머리 필터 + 페이지네이션) · 상세(댓글 + 정식 모집 승격) · 작성

### 마이페이지 (구 대시보드, `/dashboard`)
- 프로필 요약 + 탭(내 모집/내 글/지원한 모집), "내 모집" 카드에 지원자 보기 링크
- "대시보드" → "마이페이지" 라벨 변경(경로는 유지)
- 지원/모집작성/글작성 후 캐시 때문에 마이페이지가 안 갱신되던 문제 수정

### 랜딩 + 브랜딩
- 브랜드 컬러(`brand-amber`/`brand-ink`/`brand-sky` 등)가 Tailwind 테마에 한 번도 등록된 적 없어 랜딩 전체가 무효 클래스였던 버그 수정
- 헤더 nav·CTA 버튼(시작하기/둘러보기 등)이 전부 `href="#"`거나 동작 없는 `<button>`이던 것을 실제 라우트로 연결
- 실제 로고 이미지(`logo-wordmark.png`)·파비콘 적용, 메타데이터 업데이트

### 테스트 / 데이터
- **Playwright E2E**: 인증·모집작성·모집목록·지원·지원자관리·커뮤니티·마이페이지·상태(404/폼검증) 8스펙 — 17 passed / 1 skipped(데이터 부족으로 인한 정상 skip) / 0 failed
- **Prisma seed**: 화면 채우기용 더미 데이터(로그인 불가 계정 6명, 모집 10개, 커뮤니티 글 6개, 지원 6건). `npm run prisma db seed`로 실행, 재실행해도 중복 안 쌓임

### 기타 수정
- `.env.example`이 `.gitignore`의 `.env*` 패턴에 걸려 한 번도 커밋된 적 없던 문제 수정 (`!.env.example` 예외 추가)
- 프로덕션 빌드가 항상 실패하던 기존 버그 수정 — `error.tsx`(Client Component 필수)가 서버 전용 `AppShell`을 import하고 있었음

## 테스트

- `npx tsc --noEmit` 통과
- `npm run build` 통과 (프로덕션 빌드 확인)
- `npm run e2e` — 17 passed / 1 skipped / 0 failed

## 배포 전 확인 필요 (병합 후 별도 진행)

- [ ] Vercel 환경변수 5개 입력: `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`
- [ ] Supabase Authentication → URL Configuration에 배포 도메인 콜백(`/auth/callback`) 등록
- [ ] Vercel 프로덕션 브랜치를 `main`으로 지정

## 관련 문서

- `docs/report/screens-report-2026-08-18.md` — 화면별 구현 상세
- `docs/report/e2e-report-2026-08-18.md` — E2E 결과 + 발견 사항
- `docs/DEVLOG.md` — 데일리 작업 로그
