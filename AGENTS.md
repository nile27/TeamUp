# AGENTS.md

TeamUp 프로젝트에서 코드를 작성할 때 반드시 따라야 할 핵심 규칙. 상세 내용은 `docs/`의 개별 문서 참고.

---

## ⚙️ 작업 도구 안내

이 프로젝트는 **Claude Code(메인) / Antigravity / Cowork**를 번갈아 사용한다.
- **CLAUDE.md와 AGENTS.md는 항상 같은 내용을 유지**한다 (Claude Code는 CLAUDE.md, Antigravity는 AGENTS.md를 읽음).
- 규칙을 수정하면 **두 파일 다** 업데이트할 것.
- 도구를 옮겨도 아래 "진행 상태"를 보고 이어서 작업한다.

## 📍 진행 상태 (작업 시 최신화할 것)

> 도구/세션을 옮겨도 여기만 보면 이어서 진행 가능하도록, 단계 끝날 때마다 갱신.

- [x] 1단계 세팅: Next.js 생성, 패키지 설치, shadcn 초기화, Prisma 스키마 배치
- [x] `.env` 입력 (Supabase 키 4개. anon 자리에 publishable 키 사용)
- [x] Prisma 6으로 고정 + 마이그레이션 (`migrate dev`) + `server/db.ts`
- [x] shadcn 테마 주입 (DESIGN.md 색) + Pretendard — `globals.css :root`에 앰버/먹색 주입, `--font-sans` Pretendard 우선. 확인용 `/theme-test` 페이지 존재(삭제 가능)
- [x] 랜딩 이관 (_design-mockups/landing.html → components/landing)
- [x] 공통 컴포넌트 (AppNav, RecruitCard, TagFilter 등)
- [x] 인증 (features/auth) — 이메일 회원가입·로그인 + **구글/카카오 소셜 로그인 모두 실연동 완료**(Provider 설정 + 실계정 테스트, 세 방식 다 같은 계정에 identity linking 확인됨). 폼·actions·schema·`/login`·`/signup`·`/auth/callback` 완성.
- [x] 커뮤니티 (features/community) — 목록(`/community`, 말머리 필터+페이지네이션)·상세(`/community/[id]`, 댓글+승격배너)·작성(`/community/new`) 완성. `queries.ts`/`actions.ts`/`schema.ts`/`CommentList`/`PromoteBanner`/`CommunityForm`/`CommunityTagFilter` 신규.
- [x] 모집 ★핵심 (features/recruit) — 상세(`/recruit/[id]`, ISR: `unstable_cache` + `updateTag`)·작성(`/recruit/new`, 기획자 3종 장치)·지원자 관리(`/recruit/[id]/applicants`, 수락/거절) 완성. `completeness.ts`·`RecruitForm`·`PlannerGuideCard`·`StructuredForm`·`RoleInput`·`ApplyBar`·`ApplicantRow` 신규. `applyToRecruit`(중복 지원 방지)·`updateApplicationStatus` 액션 포함.
- [x] 마이페이지(`/dashboard`, 동적, 라벨은 "마이페이지"·경로는 유지) — 프로필 요약 + 탭(내 모집/내 글/지원한 모집), 빈 상태 포함. "내 모집" 카드마다 지원자 보기 링크
- [x] Playwright E2E (`e2e/`) — 인증·모집작성·모집목록·지원·지원자관리·커뮤니티·마이페이지·상태(404/폼검증) 8스펙, `npm run e2e`. 17 passed / 1 skipped / 0 failed
- [x] 반응형 점검 + Vercel 배포 — https://team-up-olive.vercel.app 실서비스 접속 가능. PR #2(dev→main) 머지 완료, CI(Lint & Typecheck) green.

**🎉 MVP 성공 기준 5개(PRD.md 7장) 전부 충족 — MVP 사실상 완료.**

- [x] E2E CI 자동화 — `.github/workflows/e2e.yml`(매일 스케줄 + 수동 실행) + `e2e/global.teardown.ts`(service_role 키로 Auth 고아 계정 정리, 키 없으면 안전하게 스킵). **GitHub repo Settings → Secrets에 `DATABASE_URL`/`DIRECT_URL`/`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SERVICE_ROLE_KEY` 등록 필요 (사용자가 직접) — 등록 전까진 워크플로가 실패함.**
- [ ] 후속 과제 (아래 "나중에 추가" 참고) ← **지금 여기**

> 상세 리포트: `docs/report/screens-report-2026-08-18.md` (만든 화면·컴포넌트·핵심 로직·미완 과제), `docs/report/e2e-report-2026-08-18.md` (E2E 결과 + P2/P3 발견사항)

## 🔜 나중에 추가 (지금은 보류 — MVP 흐름 먼저)

> 기능은 있으나 후순위로 미뤄둔 것. 까먹지 않게 여기 모아둠.

- **좋아요/저장(북마크) 토글 낙관적 업데이트** — `BookmarkButton`(`features/recruit`)·`LikeButton`(`features/community`)이 `await toggleXxx()` 서버 왕복이 끝난 뒤에야 `bookmarked`/`liked`·`count` state를 갱신함(`useTransition`으로 pending 처리만, 클릭 즉시 UI는 안 바뀜). 체감 지연 있음 — 클릭 시 먼저 낙관적으로 state를 뒤집고, 서버 에러 시 롤백하는 방식으로 개선 필요.

---

## 프로젝트 한 줄 요약

"개발 못 해도 기획자로 사이드프로젝트에 참여하는" 팀원 매칭 플랫폼. 비개발자도 기획자로 참여하도록 문을 여는 게 핵심 차별점.

---

## 기술 스택

- **프레임워크**: Next.js (App Router) + TypeScript
- **UI**: shadcn/ui + Tailwind CSS + Pretendard 폰트
- **애니메이션**: Framer Motion (motion) — 랜딩만
- **DB**: Prisma + Supabase (PostgreSQL)
  - ⚠️ **Prisma는 6 버전대(^6.19.0) 사용.** Prisma 7은 datasource URL을 prisma.config.ts로 옮기고 driver adapter를 요구하는 등 설정이 크게 바뀌어, 자료도 적고 MVP엔 과함. schema.prisma에 `url`/`directUrl` 두는 6 방식 유지. `prisma migrate`가 P1012 (datasource url no longer supported) 내면 7이 깔린 것이니 6으로 다운그레이드.
- **인증**: Supabase Auth (소셜: 구글/카카오)
- **폼/검증**: react-hook-form + zod
- **배포**: Vercel

> Phase 2에서 백엔드를 Java Spring + MySQL로 전환 예정. 그래서 **비즈니스 로직을 `lib/`에 분리**해 이관이 쉽도록 유지할 것.

---

## 핵심 아키텍처 원칙

### 1. 서버 우선 (Server-first)
- 기본은 서버 컴포넌트. `'use client'`는 **꼭 필요할 때만** (이벤트 핸들러, 브라우저 API, 낙관적 업데이트).
- 데이터 조회는 서버 컴포넌트에서 `await`. 클라이언트 fetch 훅 만들지 말 것.
- 로그인/작성/지원 등 변경(mutation)은 **Server Action**으로.

### 2. 상태는 URL로
- 필터·검색·페이지네이션 등 "상태 변화 → 데이터 재조회"는 **searchParams**에 실어 서버가 다시 렌더.
- `useState`로 목록 상태 관리하지 말 것. 필터 값은 URL에.

### 3. route는 얇게, 로직은 lib에
- API route(`app/api/*/route.ts`)는 요청/응답만 얇게.
- 비즈니스 로직(검증, 계산, DB 접근)은 **`lib/`** 에. Server Action도 같은 lib 함수 재사용.
- 이유: 재사용 + Phase 2 Spring 이관 대비.

### 4. 렌더링 전략 (페이지별)
| 페이지 | 방식 |
|--------|------|
| 랜딩, 로그인, 회원가입 | SSG |
| 커뮤니티/모집 목록·작성 | SSR |
| 모집 상세 | ISR (`tags` + `revalidateTag`, 지원/수정 시 갱신) |
| 대시보드 | 동적 (no-store, 유저별) |

---

## 디자인 규칙 (상세: DESIGN.md)

- **랜딩** = 화려하게 (색 블록 + 일러스트 + 큰 타이포). 자체 스타일.
- **앱 내부** = 담백하게 (shadcn 기반, 흰 배경 + 카드 + 여백).
- **공통 브랜드**: 앰버(`#FFA940`) 포인트 + Pretendard + 따뜻한 먹(`#2B2620`) 텍스트.
- 앰버는 **버튼/활성탭/게이지/아이콘에만**. 흰 배경 위 텍스트 색으로 쓰지 말 것.
- shadcn 테마 CSS 변수(`--primary` 등)에 DESIGN.md 색 주입해서 사용.

---

## 필수: 모든 목록·데이터 화면에 3가지 상태

정상 상태만 만들지 말 것. 반드시 처리:
- **빈 상태**: 안내 문구 + 다음 행동 유도 버튼 (예: "아직 모집이 없어요. 첫 모집을 등록해보세요")
- **로딩**: 스켈레톤 (스피너보다 스켈레톤 선호)
- **에러**: 안내 + "다시 시도" 버튼

문구는 `states_and_validation` 문서 참고.

---

## 폼 검증 규칙

- **zod 스키마는 `lib/`에** 두고 클라이언트·서버 양쪽에서 공유.
- 클라이언트(즉시 피드백) + Server Action(신뢰) **이중 검증**.
- 타이밍: 제출 시 전체 + 블러 시 해당 필드. **타이핑 중엔 에러 안 띄움**.
- 표시: 필드 테두리 빨강 + 아래 빨간 메시지 (shadcn `FormMessage`).
- 서버 에러(중복 이메일 등)는 `useActionState`로 받아 필드에 표시.

---

## 폴더 구조 (Feature 기반 · 콜로케이션)

"함께 바뀌는 것은 함께 둔다." app/은 라우팅만, 로직은 features/에.

```
src/
├─ app/                    # 라우팅 껍데기 (얇게). features 조립만
│  ├─ recruit/page.tsx
│  └─ recruit/_components/ # (선택) 이 라우트 전용 컴포넌트 (_ = 라우팅 제외)
├─ features/               # ★ 기능별 응집
│  ├─ recruit/
│  │  ├─ components/
│  │  ├─ actions.ts        # 'use server' 액션 (생성·수정·지원)
│  │  ├─ queries.ts        # 조회 함수
│  │  ├─ schema.ts         # zod (클라·서버 공유)
│  │  ├─ completeness.ts   # 완성도 계산
│  │  └─ types.ts
│  ├─ community/  auth/  dashboard/  landing/
├─ components/ui/          # shadcn (도메인 무관 디자인 시스템)
├─ lib/                    # 순수 유틸 (cn, formatDate)
├─ server/                 # db.ts, supabase.ts (외부 클라이언트 래퍼)
├─ hooks/                  # 도메인 무관 공용 훅
└─ config/                 # 상수·환경
```

**원칙**:
- **app/은 얇게, features/는 두껍게** — page.tsx는 features의 컴포넌트·쿼리를 조립만.
- **콜로케이션** — 한 기능의 컴포넌트·액션·쿼리·스키마·타입을 같은 폴더에.
- **읽기/쓰기 분리** — `queries.ts`(조회, 서버 컴포넌트용) + `actions.ts`(변경, Server Action).
- **한 라우트 전용 컴포넌트**는 `app/.../_components/`에 (features 안 감).
- **배럴 파일(index.ts) 남발 금지** — 트리쉐이킹 방해·순환참조. 명확한 경계에서만.
- 상세: `feature_structure`, `component_breakdown` 문서.

---

## 코드 컨벤션

- 컴포넌트 파일명: kebab-case (`recruit-card.tsx`), 컴포넌트명: PascalCase.
- 서버 컴포넌트가 기본. 클라이언트는 파일 최상단 `'use client'` + 최대한 작게 격리.
- 타입은 Prisma 생성 타입 활용. 임의로 중복 정의하지 말 것.
- 하드코딩된 색/폰트 금지 → 항상 테마 변수 사용.
- 주석은 "왜"를 설명 (무엇은 코드가 말해줌).

---

## 커밋 메시지 컨벤션

AI 에이전트(Claude Code, Antigravity 등)가 커밋 메시지를 추천할 때 반드시 아래 규칙(Conventional Commits)을 따를 것.
기본 구조: `타입(선택사항: 도메인): 작업 요약 (한국어 권장)`
- **feat**: 새로운 기능 추가
- **fix**: 버그 또는 에러 수정
- **design**: CSS 등 사용자 UI 디자인 변경 (기능 변경 없음)
- **refactor**: 코드 리팩토링 (기능 변화 없이 구조만 개선)
- **chore**: 설정 파일 변경, 패키지 설치, 빌드 업무 등
- **docs**: 문서 수정 (README, AGENTS.md, PRD 등)
- **style**: 코드 포맷팅, 세미콜론 누락, 오타 수정 (로직 영향 없음)

---

## 하지 말 것

- ❌ 클라이언트에서 데이터 fetch 훅 만들기 (서버 컴포넌트 사용)
- ❌ 목록 필터를 useState로 관리 (searchParams 사용)
- ❌ API route에 비즈니스 로직 직접 작성 (lib으로)
- ❌ 정상 상태만 만들고 빈/로딩/에러 빼먹기
- ❌ 앰버를 흰 배경 텍스트 색으로 사용
- ❌ 랜딩 톤을 앱 내부에 그대로 적용 (분리)
- ❌ localStorage/sessionStorage 사용 (서버·쿠키 기반)
- ❌ git push 및 commit -m 허락없이는 하지 말고, 커밋 메세지 추천 정도만 말해 줄 것

## 환경변수 (.env) — 중요

- **`.env` 파일은 절대 직접 생성·수정·삭제하지 말 것.** 실제 키가 들어있는 파일이므로 건드리면 안 됨.
- 대신 **`.env.example`** (예시/플레이스홀더만) 파일을 만들어 필요한 변수 목록을 안내할 것.
  - 예: `DATABASE_URL=`, `DIRECT_URL=`, `NEXT_PUBLIC_SUPABASE_URL=`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=` 등 키 이름만, 값은 비우거나 `your-key-here`.
- `.env`는 `.gitignore`에 포함되어야 하며, `.env.example`만 커밋.
- 실제 값 입력은 사용자가 직접 함. Claude Code는 값을 요구하거나 채우지 말 것.

---

## 참고 문서 (docs/)

- `PRD.md` — 서비스·기능 명세
- `ARCHITECTURE.md` — 폴더 구조·렌더링·API 상세
- `SCHEMA.md` — 데이터 모델
- `DESIGN.md` — 디자인 시스템
- `component_breakdown` — 컴포넌트 분리
- `states_and_validation` — 빈/로딩/에러 + 폼 검증
- `DEVLOG.md` — 데일리 작업 로그 (그날 한 일·막힌 것·다음 할 일. 작업 끝낼 때 맨 위에 추가)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
