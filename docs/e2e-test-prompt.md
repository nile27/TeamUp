# 코드 에이전트 프롬프트 — TeamUp Playwright E2E 테스트

> 아래 전체를 코드 에이전트에게 그대로 전달하세요.

---

TeamUp 프로젝트에 Playwright E2E 테스트를 세팅하고 핵심 플로우를 자동화해줘. `dev` 브랜치 기준.

## 세팅
- `npm i -D @playwright/test && npx playwright install --with-deps chromium`.
- `playwright.config.ts` 생성:
  - `testDir: './e2e'`, `baseURL: 'http://localhost:3000'`.
  - `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120000 }` — 테스트 시 자동으로 앱 기동.
  - `use: { trace: 'on-first-retry', screenshot: 'only-on-failure' }`, reporter는 `html`.
- `.gitignore`에 `/test-results/`, `/playwright-report/`, `/e2e/.auth/` 추가.

## 인증 처리 (storageState 재사용)
- Supabase "Confirm email"이 꺼져 있어야 가입 자동화 가능(켜져 있으면 리포트에 명시하고 사전 생성된 계정 사용).
- `e2e/global.setup.ts`(project dependency)에서 **작성자 A / 지원자 B** 두 계정으로 로그인(없으면 회원가입) 후 `e2e/.auth/a.json`, `e2e/.auth/b.json`으로 storageState 저장.
- config의 `projects`를 `setup` → `authoredA`(storageState a) → `applicantB`(storageState b)로 구성해 로그인 상태 재사용. 이메일은 타임스탬프로 유니크하게(`teamup+<ts>@example.com` 등, Supabase가 유효로 보는 형식).

## 스펙 (e2e/*.spec.ts)
셀렉터는 **role/label 기반**(`getByRole`, `getByLabel`, `getByText`) 우선. 필요한 요소엔 `data-testid` 추가 제안.

1. `auth.spec.ts` — 회원가입→진입, 로그아웃, 미로그인 상태에서 `/recruit/new` 접근 시 `/login` 리다이렉트.
2. `recruit-create.spec.ts` (A) — 유형·제목·본문·구조화 4문항·역할·기술스택 입력, **구조화 폼 채울수록 완성도 게이지 % 증가** 검증, 저장 후 상세로 이동 확인.
3. `recruit-list.spec.ts` — 기술스택 필터 클릭 시 URL `?stack=` 반영 + 목록 필터링(searchParams), 카드 정보 표시.
4. `recruit-apply.spec.ts` (B) — 상세에서 지원 성공, **같은 계정 재지원 시 중복 방지** 메시지.
5. `community.spec.ts` — 작성, 말머리 필터+페이지네이션, 댓글 작성, IDEA 글 "정식 모집으로 승격" → `/recruit` 연결.
6. `dashboard.spec.ts` — 내 모집/내 글/지원한 모집 탭 데이터·상태 표시.
7. `states.spec.ts` — 빈 상태(안내+CTA), 존재하지 않는 `/recruit/[없는id]` 에러/404, 폼 검증(빈/짧은 값 제출 시 필드 에러, 타이핑 중 에러 없음).

## 실행 & 리포트
- `package.json`에 `"e2e": "playwright test"`, `"e2e:ui": "playwright test --ui"` 추가.
- 전체 실행해서 통과/실패 정리. 실패는 `docs/report/e2e-report-YYYY-MM-DD.md`에 스펙별 ✅/❌ + 실패 재현·원인추정·관련 파일 + 스크린샷/trace 경로로 정리. 마지막에 P1/P2 수정 목록.

## 주의
- `.env` 수정 금지, 허락 없이 git commit/push 금지, Prisma 7 금지.
- 테스트가 만든 DB 데이터는 유니크 식별자로 격리하고, 정리 방법(또는 전용 테스트 계정)을 리포트에 명시.
- 플레이키(불안정) 테스트는 `expect(...).toBeVisible()` 등 web-first assertion으로 대기 처리, 임의 `waitForTimeout` 지양.
