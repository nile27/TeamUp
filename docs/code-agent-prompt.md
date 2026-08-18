# 코드 에이전트 작업 프롬프트 — TeamUp 남은 화면 전체 구현

> 아래 전체를 코드 에이전트에게 그대로 전달하세요.

---

TeamUp 프로젝트의 남은 화면 전부를 구현해줘. 반드시 루트 `CLAUDE.md` 규칙과 `docs/`(PRD·ARCHITECTURE·SCHEMA·DESIGN·COMPONENTS·STATES)를 먼저 읽고 따를 것. 작업 끝나면 `docs/DEVLOG.md` 맨 위에 그날 항목 추가.

## 0. 브랜치 세팅 (작업 시작 전)
- **`dev` 브랜치에서 작업**한다. `dev`가 없으면 생성 후 체크아웃.
- 로그인/회원가입은 **`auth` 브랜치에 이미 구현**돼 있으니, `dev`로 그 작업을 가져와서 이어서 함께 작업한다. (`git merge auth` 또는 `git cherry-pick`으로 `auth` 브랜치의 인증 작업을 `dev`에 반영). 인증 코드(`features/auth`, `/login`, `/signup`, `/auth/callback`)를 재사용해 나머지 화면과 연결.
- 충돌 나면 인증 관련 파일은 `auth` 브랜치 것을 기준으로 정리.
- **허락 없이 git push/commit 금지** — 커밋 메시지 추천만.

## 목표: 아래 7개 페이지 + 지원/댓글/승격 로직 완성
현재 랜딩·로그인·회원가입·모집목록(`/recruit`)은 완료. 아래를 만든다.

### A. 모집 (★핵심 먼저)
1. **`/recruit/new` (작성)** — 서비스의 심장. `AppShell` + 아래 구성:
   - `PlannerGuideCard`(신규, `features/recruit/components/`): 기획자 안내 앰버 박스. "아이디어만 던지고 끝이 아닙니다. 문서화·의사결정·QA로 함께하면 기획 포트폴리오가 남습니다."
   - 유형 선택(DEV/PLAN) + 제목 + 본문
   - `StructuredForm`(신규): 구조화 폼 4문항(problem/targetUser/coreFeatures/reference) — 일상어 라벨(PRD 3.3 참고)
   - `RoleInput`(신규): 역할명+인원 동적 추가/삭제
   - 기존 `TechStackInput`(controlled: `value:string[]`, `onChange`) 재사용
   - 기존 `CompletenessGauge` 재사용 — 폼 채운 정도로 실시간 % 표시(강제 아님, 보상)
2. **`/recruit/[id]` (상세, ISR)** — `CompletenessGauge` + 구조화 기획 정보 카드 + 역할 뱃지 + `ApplyBar`(신규, 하단 지원 바). 지원/수정 시 `revalidateTag`로 갱신.

### B. 커뮤니티 (`features/community/` — 거의 신규)
3. **`/community` (목록, SSR)** — `PageHeader` + 말머리 필터(전체/IDEA/QUESTION/ETC) + 기존 `post-list-item.tsx` 목록 + 페이지네이션
4. **`/community/[id]` (상세)** — 본문 + `CommentList`(댓글 목록+입력) + IDEA 글이면 `PromoteBanner`(정식 모집으로 승격)
5. **`/community/new` (작성)** — 말머리 선택 + 제목 + 본문. 심플.

### C. 대시보드
6. **`/dashboard` (동적, no-store)** — `Avatar` + 프로필 요약 + `Tabs`(내 모집 / 내 글 / 지원한 모집+상태). 기존 `RecruitCard`·`post-list-item` 재사용.

### D. 서버 로직 (읽기/쓰기 분리)
- `features/recruit/actions.ts`에 `applyToRecruit`(중복지원 방지 `@@unique` 활용), 필요시 상세용 `getRecruitById` 쿼리 추가.
- **완성도 계산**: `features/recruit/completeness.ts` 신규 — problem/targetUser/coreFeatures/reference 채운 정도로 0~100 계산. `createRecruit`에서 계산해 `completeness` 저장(지금은 저장 안 하고 있음 → 추가). 클라 폼에서도 같은 함수로 실시간 게이지.
- `features/community/`에 `queries.ts`(목록/상세), `actions.ts`(글 작성·댓글·승격), `schema.ts`(zod) 생성. 승격은 `CommunityPost.promotedRecruit ↔ Recruit.promotedFrom` 1:1 연결.
- 현재 유저: `const supabase = await createClient(); const { data:{ user } } = await supabase.auth.getUser();` (참고: `server/supabase.ts`, `AppNav`에 예시 있음). 미로그인 시 작성/지원은 `/login`으로 리다이렉트.

## 준수 규칙 (중요)
- **기존 컨벤션 그대로**: `AppShell`/`PageHeader`/`RecruitCard`(mapped `data` prop 형태)/`CompletenessGauge`/`TechStack*` 재사용. 새 파일은 kebab-case, feature 콜로케이션(components/actions/queries/schema).
- **서버 우선** — 조회는 서버 컴포넌트 `await`. `'use client'`는 폼·인터랙션만 최소 격리. 목록 필터·페이지네이션은 **searchParams**로(useState 금지).
- **3가지 상태 필수** — 모든 목록/데이터 화면에 빈/로딩(스켈레톤)/에러(`error.tsx`). 기존 `/recruit`의 패턴 따라할 것.
- **폼 검증** — zod 스키마 `features/*/schema.ts`에 두고 클라(react-hook-form+zodResolver)+서버 이중 검증. 타이핑 중 에러 X, 제출/블러 시 표시.
- **색은 테마 변수 사용** — `--primary`가 이미 앰버(#FFA940)로 주입돼 있으니 신규 코드는 하드코딩(`bg-[#FFA940]`) 말고 `bg-primary text-primary-foreground` / `bg-secondary`(옅은앰버) 사용. (기존 파일에 하드코딩 남아있지만 새 코드는 테마로.)
- **하지 말 것**: localStorage, 클라 fetch 훅, API route에 비즈니스 로직, `.env` 수정, Prisma 7 업그레이드, 허락 없이 git commit/push.
- shadcn UI는 `components/ui`에 있는 것 사용(button/card/badge/input/textarea/label/progress/tabs/avatar/separator/pagination/sonner). 없으면 `npx shadcn add`로 추가.

## 마무리
- `npx tsc --noEmit` 통과 확인.
- `CLAUDE.md`·`AGENTS.md` "진행 상태" 체크리스트 갱신(커뮤니티·모집·대시보드 반영), `docs/DEVLOG.md` 항목 추가.
- **작업 리포트 작성** — `docs/report/` 폴더를 만들고 그 안에 `screens-report-YYYY-MM-DD.md`(오늘 날짜)로 이번 작업 리포트를 남길 것. 다음 내용 포함:
  1. **만든 화면 목록** — 페이지명 · 경로 · 렌더링 방식(SSR/ISR/동적) · 상태(완료/부분).
  2. **각 화면 구현 내용** — 어떤 컴포넌트로 구성했는지, 어떤 데이터를 조회/변경하는지(사용한 queries/actions 함수명), 빈/로딩/에러 상태를 어떻게 처리했는지.
  3. **새로 만든 것** — 신규 컴포넌트·actions·queries·schema·유틸(`completeness.ts` 등) 파일 목록과 각 역할 한 줄 설명.
  4. **핵심 로직 설명** — 완성도 계산 방식, 지원 중복 방지, 커뮤니티→모집 승격 연결 방식.
  5. **미완/후속 과제** — 못 끝낸 것, 알려진 이슈, 다음에 할 일(예: OAuth 실테스트, 반응형, 배포).
  - 마크다운은 표·목록으로 스캔하기 쉽게. 화면·파일 기준으로 구체적으로 적을 것.

## 권장 진행 순서
A(모집) → D(로직) → B(커뮤니티) → C(대시보드). 각 단계 끝날 때마다 `npm run dev`로 확인.
