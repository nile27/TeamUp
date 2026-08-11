# ARCHITECTURE.md — 기술 아키텍처

TeamUp 기술 구조 문서. "어떻게 만드는가"를 정의한다.

---

## 1. 전체 구조

```
[클라이언트]
  브라우저 (Next.js 웹)
        │
        ↓ (같은 앱 내)
[Next.js App Router]
  서버 컴포넌트 ── await ──→ lib/ ──→ Prisma ──→ Supabase(PostgreSQL)
  Server Action ─────────────↑
  API route(app/api) ────────↑   ← Phase 2 RN 앱이 호출할 자리
        │
[Supabase]
  PostgreSQL (DB) + Auth (인증)
```

- 지금은 **Next.js 풀스택** (프론트+백 한 몸).
- Phase 2에서 백엔드를 **Java Spring + MySQL**로 분리 예정 → 그래서 로직을 `lib/`에 모아둠(이관 대비).

---

## 2. 폴더 구조 (Feature 기반 · 콜로케이션)

"함께 바뀌는 것은 함께 둔다." `app/`은 라우팅 전용(얇게), 로직·컴포넌트는 `features/`에 기능별 응집. 도메인 무관 공용은 루트 레벨(`components/ui`, `lib`, `server`, `hooks`, `config`).

```
teamup/
├─ src/
│  ├─ app/                          # 라우팅 껍데기 (얇게). features 조립만
│  │  ├─ (marketing)/page.tsx       # 랜딩 (SSG) → features/landing
│  │  ├─ login/ signup/             # SSG → features/auth
│  │  ├─ community/
│  │  │  ├─ page.tsx                # 목록 (SSR) → features/community
│  │  │  ├─ [id]/page.tsx           # 상세 (SSR)
│  │  │  └─ new/page.tsx            # 작성 (SSR)
│  │  ├─ recruit/
│  │  │  ├─ page.tsx                # 목록 (SSR) → features/recruit
│  │  │  ├─ [id]/page.tsx           # 상세 (ISR)
│  │  │  ├─ new/page.tsx            # 작성 (SSR)
│  │  │  └─ _components/            # (선택) 이 라우트 전용 (_ = 라우팅 제외)
│  │  ├─ dashboard/page.tsx         # 동적
│  │  ├─ api/                       # route.ts (얇게) → feature queries/actions 호출
│  │  ├─ layout.tsx  globals.css    # globals: shadcn 테마
│  │
│  ├─ features/                     # ★ 기능별 응집
│  │  ├─ recruit/
│  │  │  ├─ components/             # RecruitCard, CompletenessGauge, PlannerGuideCard,
│  │  │  │                          #   StructuredForm, RoleInput, ApplyBar
│  │  │  ├─ actions.ts              # 'use server' — 생성·수정·지원 (Spring 이관 대상)
│  │  │  ├─ queries.ts              # 조회 함수 (서버 컴포넌트용)
│  │  │  ├─ schema.ts               # zod (클라·서버 공유)
│  │  │  ├─ completeness.ts         # 완성도 계산
│  │  │  └─ types.ts
│  │  ├─ community/                 # PostListItem, PromoteBanner, CommentList + actions/queries/schema
│  │  ├─ auth/                      # login-form, signup-form, social-buttons + actions/schema
│  │  ├─ dashboard/                 # profile-summary + queries
│  │  └─ landing/                   # Hero, Problem, Flow, Participation, Planner, CTA, Footer
│  │
│  ├─ components/ui/                # shadcn 기본 (도메인 무관 디자인 시스템)
│  ├─ lib/                          # 순수 유틸 (cn, formatDate)
│  ├─ server/                       # db.ts (Prisma 싱글턴), supabase.ts (외부 래퍼)
│  ├─ hooks/                        # 도메인 무관 공용 훅
│  └─ config/                       # 상수·환경
│
├─ prisma/schema.prisma
├─ public/                          # 랜딩 일러스트(svg)
├─ .env  .env.example
└─ CLAUDE.md  docs/
```

**원칙**:
- **app/은 얇게, features/는 두껍게** — page.tsx는 features의 컴포넌트·쿼리를 조립만.
- **콜로케이션** — 한 기능의 컴포넌트·액션·쿼리·스키마·타입이 한 폴더에.
- **읽기/쓰기 분리** — `queries.ts`(조회) + `actions.ts`(변경). 서버 컴포넌트 조회 vs Server Action 구분과 일치.
- **라우트 전용 컴포넌트** → `app/.../_components/` (features 안 감).
- **배럴 파일(index.ts) 남발 금지** — 트리쉐이킹·순환참조 주의.
- 경로 별칭 `@/*` 사용 (깊은 상대경로 제거).

상세: `feature_structure` 문서.

---

## 3. 렌더링 전략 상세

| 페이지 | 방식 | 캐시/비고 |
|--------|------|-----------|
| 랜딩·로그인·회원가입 | SSG | 정적. 빌드 시 생성 |
| 커뮤니티 목록 | SSR | 새 글 바로 반영. 짧은 캐시 or 동적 |
| 커뮤니티 상세 | SSR | 조회수 등. (원하면 ISR 가능) |
| 커뮤니티/모집 작성 | SSR | 폼. 로그인 확인 |
| 모집 목록 | SSR | 유형 필터(searchParams) |
| 모집 상세 | **ISR** | `next: { tags: ['recruit-{id}'] }` → 지원/수정/마감 시 `revalidateTag` |
| 대시보드 | 동적 | `no-store`, 유저별 |

**필터·페이지네이션은 searchParams로.** 예: `/recruit?type=dev&page=2` → 서버 컴포넌트가 searchParams 읽어 재조회.

---

## 4. 데이터 흐름 패턴

### 읽기 (조회)
```
서버 컴포넌트 → features/recruit/queries.ts (getRecruits) → Prisma → DB
```
- 서버 컴포넌트에서 직접 `await`. 클라이언트 fetch 훅 없음.

### 쓰기 (변경)
```
<form action={createRecruit}> → features/recruit/actions.ts (Server Action)
  → 검증 + 완성도 계산 + Prisma → DB
  → revalidatePath/revalidateTag
```

### API route (Phase 2 RN 대비)
```
app/api/recruit/route.ts (얇게) → features/recruit/queries.ts (동일 함수 재사용) → Prisma
```
- 웹은 Server Action(actions.ts), 앱(미래)은 API route. **로직은 feature에 한 벌만.**

---

## 5. queries / actions 계층 규칙 (중요 — Spring 이관 대비)

- **route.ts / Server Action은 얇게**: 요청 파싱 + queries/actions 호출 + 응답.
- **feature의 `queries.ts`(읽기) + `actions.ts`(쓰기)가 실제 로직**: 검증, 완성도 계산, DB 접근.
- 읽기/쓰기 분리 이유: 서버 컴포넌트는 queries로 조회, Server Action은 actions로 변경 — 역할이 명확.
- Spring 이관 시: 각 feature의 queries+actions가 Spring 서비스 계층 하나에 대응.

```ts
// features/recruit/queries.ts — 조회 (서버 컴포넌트가 호출)
import { db } from "@/server/db";
export async function getRecruits(filter: RecruitFilter) {
  return db.recruit.findMany({ where: filter, include: { roles: true } });
}

// features/recruit/actions.ts — 변경 (Server Action)
"use server";
import { db } from "@/server/db";
import { recruitSchema } from "./schema";
import { calcCompleteness } from "./completeness";
export async function createRecruit(input: RecruitInput) {
  const parsed = recruitSchema.parse(input);        // 검증
  const completeness = calcCompleteness(parsed);    // 완성도 계산
  const recruit = await db.recruit.create({ data: { ...parsed, completeness } });
  revalidatePath("/recruit");
  return recruit;
}
```

---

## 6. 인증 흐름 (Supabase Auth)

- 회원가입/로그인 → Supabase Auth (`lib/auth.ts` 헬퍼로 감쌈).
- 세션은 쿠키 기반. 서버 컴포넌트에서 세션 읽어 인증 확인.
- 소셜: 구글/카카오 OAuth (Supabase 대시보드에서 설정).
- 보호 페이지(작성, 대시보드): 서버에서 세션 없으면 `/login`으로 redirect.
- **Phase 2**: 이 부분을 Spring Security로 대체.

---

## 7. 폼 검증

- zod 스키마는 `lib/validations/`에 두고 **클라이언트·서버 공유**.
- 클라이언트: react-hook-form + zodResolver (즉시 피드백).
- 서버: Server Action에서 같은 스키마로 재검증 (신뢰).
- 상세: `states_and_validation` 문서.

---

## 8. 환경 세팅 순서

### [사용자가 하는 것] — 외부 서비스
1. **Supabase 프로젝트 생성** (supabase.com) → DB·Auth 활성화.
2. Supabase 대시보드에서 키 복사:
   - `DATABASE_URL`, `DIRECT_URL` (Settings → Database)
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API)
3. (선택) 소셜 로그인: 구글/카카오 개발자 콘솔에서 OAuth 키 발급 → Supabase Auth에 등록.

### [Claude Code가 하는 것] — 코드/파일
4. `create-next-app` (TS, App Router, Tailwind).
5. shadcn 초기화 + 컴포넌트 추가.
6. Prisma 설치 + `schema.prisma` 배치.
7. 패키지 설치 (prisma, @supabase/*, react-hook-form, zod, framer-motion 등).
8. `.env.example` 생성 (변수 이름만, 값 비움).
9. 폴더 구조 생성.

### [사용자가 하는 것] — 키 입력
10. `.env.example` 보고 `.env`에 **실제 키 채우기**. (Claude Code는 이 파일 안 건드림)

### [Claude Code가 하는 것] — 마이그레이션·개발
11. `prisma migrate dev` (스키마 → DB 테이블 생성).
12. 개발 시작 (컴포넌트 → 페이지 순).

> `.env`는 **사용자가 직접 관리**. Claude Code는 `.env.example`만 만들고 실제 값은 요구·입력하지 않음.

---

## 9. 필요 패키지

```
# 핵심
next react react-dom typescript

# DB
prisma @prisma/client
@supabase/supabase-js @supabase/ssr

# 폼/검증
react-hook-form zod @hookform/resolvers

# UI
tailwindcss  (shadcn이 설정)
framer-motion  (motion — 랜딩)
lucide-react  (아이콘)

# shadcn 컴포넌트는 npx shadcn add 로 개별 추가
```

---

## 10. Phase 2 전환 지점 (미래)

- **백엔드 분리**: 각 feature의 `queries.ts`+`actions.ts` → Java Spring 서비스 계층. `app/api` → Spring REST API.
- **DB**: PostgreSQL(Supabase) → MySQL. Prisma → JPA/MyBatis. 복잡 쿼리는 MyBatis raw SQL.
- **인증**: Supabase Auth → Spring Security (JWT).
- **모바일**: RN 앱이 Spring API 호출 (UI만 새로, 로직 재사용).
- 프론트(Next.js)는 데이터 계층만 API 호출로 바꾸면 됨 — 서사: "모바일 확장 위해 백엔드 분리".
