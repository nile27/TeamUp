# 작업 리포트 — 남은 화면 전체 구현 (2026-08-18)

`docs/code-agent-prompt.md` 지시에 따라 모집 상세/작성, 커뮤니티 전체, 대시보드를 구현. `feat/auth` 브랜치의 인증 작업을 `dev`에 먼저 머지하고 그 위에서 진행.

---

## 1. 만든 화면 목록

| 페이지 | 경로 | 렌더링 | 상태 |
|--------|------|--------|------|
| 모집 상세 | `/recruit/[id]` | ISR (`unstable_cache` + `updateTag`) | 완료 |
| 모집 작성 ★ | `/recruit/new` | SSR (폼) | 완료 |
| 커뮤니티 목록 | `/community` | SSR | 완료 |
| 커뮤니티 상세 | `/community/[id]` | SSR | 완료 |
| 커뮤니티 작성 | `/community/new` | SSR (폼) | 완료 |
| 대시보드 | `/dashboard` | 동적 (auth 쿠키로 인해 자동 dynamic) | 완료 |

기존에 있던 `/recruit`(목록)은 손대지 않음. 로그인/회원가입/랜딩은 별도 세션에서 이미 완료.

---

## 2. 각 화면 구현 내용

### `/recruit/[id]` — 모집 상세
- 구성: `Badge`(유형/상태) · 제목/작성자 · `TechStackTags` · `CompletenessGauge` · 역할 뱃지 · 소개 본문 · 기획 정보 카드(4문항 중 채워진 것만) · `ApplyBar`(하단 고정)
- 조회: `getRecruitById(id)` (author/roles/지원자수 포함), `getApplicationForUser(recruitId, userId)`
- 빈/에러: 없는 글 → `notFound()` → `not-found.tsx`("모집글을 찾을 수 없어요" + 목록으로). 로딩 → `loading.tsx` 스켈레톤. 에러 → 상위 `/recruit/error.tsx` 공용 바운더리(세그먼트 상속)
- `ApplyBar`는 4가지 상태 분기: 작성자 본인 / 비로그인(로그인 유도) / 마감 / 이미 지원함 / 지원 폼

### `/recruit/new` — 모집 작성 ★핵심
- 구성: `PlannerGuideCard`(기획자 안내) → 유형 토글(DEV/PLAN) → 제목/소개 → `RoleInput`(역할 동적 추가/삭제) → `TechStackInput`(재사용) → `CompletenessGauge`(실시간) → `StructuredForm`(4문항)
- 미로그인이면 서버에서 `/login`으로 redirect
- 제출: `RecruitForm`(react-hook-form + zod, `roles`는 `useFieldArray`) → FormData로 `techStack`/`roles`를 JSON 문자열로 담아 `createRecruit` Server Action 호출
- 검증: 클라이언트(zodResolver) + 서버(`createRecruitSchema.safeParse`) 이중 검증, 서버 필드 에러는 `setError`로 재매핑
- 완성도: 클라이언트에서 `watch()`한 4문항으로 실시간 계산해 게이지에 표시(같은 `calcCompleteness` 함수를 서버 저장 시에도 재사용 → 로직 한 벌)

### `/community` — 커뮤니티 목록
- 구성: `PageHeader` · `CommunityTagFilter`(전체/아이디어/질문/기타, URL `?tag=`) · `PostListItem` × N · `Pagination`(URL `?page=`)
- 조회: `getCommunityPosts(tag, page)` (페이지당 10개)
- 빈 상태: "아직 글이 없어요. 첫 아이디어를 남겨보세요." + 글쓰기 버튼. 로딩: `Suspense` + 스켈레톤(`/recruit` 목록과 동일 패턴)

### `/community/[id]` — 커뮤니티 상세
- 구성: 말머리 뱃지 · 제목/작성자 · (IDEA 글 + 작성자 본인 + 미승격 상태면) `PromoteBanner` · 본문 · `CommentList`
- 조회: `getCommunityPostById(id)` (author, comments+author, promotedRecruit 포함)
- 빈/에러: 없는 글 → `not-found.tsx`. 승격 실패(작성자 아님/이미 승격됨)는 `?promoteError=` 쿼리로 리다이렉트 후 상세 페이지 상단에 인라인 에러 배너로 표시
- `CommentList`는 댓글 0개면 "첫 댓글을 남겨보세요." 안내, 비로그인이면 입력창 대신 로그인 안내

### `/community/new` — 커뮤니티 작성
- 구성: 말머리 토글(IDEA/QUESTION/ETC) · 제목 · 내용 · 등록 버튼
- `CommunityForm` → `createPost` Server Action. 미로그인이면 서버에서 `/login` redirect

### `/dashboard` — 대시보드
- 구성: `Avatar`(닉네임 이니셜) + 프로필 요약 · `Tabs`(내 모집 / 내 글 / 지원한 모집)
- 조회: `getDashboardProfile`, `getMyRecruits`, `getMyApplications`를 `Promise.all`로 한 번에 가져와 탭 전환 시 재요청 없음(탭 전환은 이미 로드된 데이터를 보여주기만 하므로 URL 상태 불필요 — 목록 필터처럼 재조회가 일어나는 경우가 아님)
- 내 모집/내 글은 기존 `RecruitCard`/`PostListItem` 재사용. 지원한 모집은 신규 `ApplicationItem`(상태 뱃지: 대기/수락/거절)
- 3개 탭 각각 STATES.md 문구대로 빈 상태 처리

---

## 3. 새로 만든 것

### 컴포넌트
| 파일 | 역할 |
|------|------|
| `features/recruit/components/planner-guide-card.tsx` | 기획자 역할 가이드 앰버 박스 |
| `features/recruit/components/structured-form.tsx` | 구조화 기획 폼 4문항 (일상어 라벨) |
| `features/recruit/components/role-input.tsx` | 역할명+인원 동적 추가/삭제 (`useFieldArray` 연동) |
| `features/recruit/components/apply-bar.tsx` | 상세 하단 고정 지원 바 (상태 4분기) |
| `features/recruit/components/recruit-form.tsx` | 모집 작성 폼 전체 조립 (react-hook-form) |
| `features/community/components/promote-banner.tsx` | 🌱 정식 모집으로 만들기 배너 |
| `features/community/components/comment-list.tsx` | 댓글 목록 + 입력 폼 |
| `features/community/components/community-form.tsx` | 커뮤니티 작성 폼 |
| `features/community/components/community-tag-filter.tsx` | 말머리 필터 (URL 기반, 공용 `TagFilter` 재사용) |
| `features/dashboard/components/application-item.tsx` | 지원한 모집 1줄 (제목+상태 뱃지) |

### actions / queries / schema / 유틸
| 파일 | 역할 |
|------|------|
| `features/recruit/completeness.ts` | 기획 완성도 계산 (`calcCompleteness`) — 클라이언트(실시간 게이지)·서버(저장) 양쪽에서 재사용 |
| `features/recruit/schema.ts` | `createRecruitSchema`(유형·제목·설명·역할·기술스택·기획4문항), `applyToRecruitSchema` |
| `features/recruit/queries.ts` | `getRecruitById`(ISR 캐시), `getApplicationForUser` 추가 (기존 `getRecruitList` 유지) |
| `features/recruit/actions.ts` | `createRecruit`(FormData→zod→완성도 계산→저장→상세로 redirect), `applyToRecruit`(중복지원 방지, `updateTag`) — 기존의 미사용 시그니처를 실제 Server Action 형태로 재작성 |
| `features/community/schema.ts` | `createPostSchema`, `createCommentSchema` |
| `features/community/queries.ts` | `getCommunityPosts`(페이지네이션), `getCommunityPostById` |
| `features/community/actions.ts` | `createPost`, `createComment`, `promoteToRecruit` |
| `features/dashboard/queries.ts` | `getDashboardProfile`, `getMyRecruits`, `getMyPosts`, `getMyApplications` |
| `config/labels.ts` | `RecruitType`/`CommunityTag` 한글 라벨 매핑 (여러 화면에서 공유) |

### 기존 파일 수정
- `components/common/tag-filter.tsx`: `tags: string[]` → `tags: {value,label}[]`로 변경 (표시 라벨과 실제 값을 분리해야 하는 커뮤니티 필터 요구사항 때문). 사용처였던 `components-test` 페이지도 같이 수정.
- `app/recruit/error.tsx`(기존): `AppShell` 제거 — 아래 "발견한 버그" 참고.

---

## 4. 핵심 로직 설명

### 기획 완성도 계산
`features/recruit/completeness.ts`의 `calcCompleteness()`가 `problem`/`targetUser`/`coreFeatures`/`reference` 4개 필드 중 공백이 아닌 값이 채워진 개수를 세어 `(채운 개수 / 4) * 100`을 반환. 작성 폼에서는 `watch()`로 실시간 호출해 게이지에 표시하고, 서버 액션(`createRecruit`)에서도 동일 함수로 계산해 `completeness` 컬럼에 저장(SCHEMA.md 확정 방침대로 "저장" 방식).

### 중복 지원 방지
DB 레벨의 `Application.@@unique([applicantId, recruitId])` 제약에 의존. `applyToRecruit`은 별도 사전 조회 없이 바로 `create`를 시도하고, Prisma가 던지는 unique 제약 위반(P2002)을 catch해서 "이미 지원했거나..." 에러로 변환. 상세 페이지 진입 시엔 `getApplicationForUser`로 미리 조회해 이미 지원한 경우 애초에 지원 폼 대신 "지원 완료" 비활성 버튼을 보여줌 (이중 방어).

### 커뮤니티 → 모집 승격 연결
`CommunityPost.promotedRecruit` ↔ `Recruit.promotedFrom`(`promotedFromId`, `@unique`) 1:1 관계를 그대로 사용. `promoteToRecruit` 액션은 (1) 로그인 확인 (2) 글 작성자 본인인지 확인 (3) 글의 제목/본문을 그대로 가져와 `Recruit`을 생성하며 `promotedFromId: post.id`로 연결, 기본 역할 "팀원 1명" 하나를 붙여 즉시 지원 가능한 상태로 만든 뒤 새 모집 상세로 redirect. 이미 승격된 글(unique 제약 위반)이거나 작성자가 아니면 `/community/[id]?promoteError=...`로 되돌려 상세 페이지에서 에러 배너로 안내. **MVP 범위상 승격 시 별도 편집 화면 없이 원본 글 내용으로 바로 생성**하며(PRD 5 "글 수정 페이지는 Phase 2"와 동일한 선상의 단순화), 이후 필요하면 모집 상세에서 계속 채워나가는 흐름(기획 4문항 등은 비어있는 채로 시작, 완성도 0%).

---

## 5. 미완 / 후속 과제

- **반응형 미검증**: 새로 만든 화면들을 모바일 폭에서 실제로 확인하지 않음. 특히 `/recruit/new`의 역할 입력 줄, 대시보드 탭이 좁은 화면에서 어떻게 깨지는지 확인 필요.
- **배포 전 상태**: Vercel 프로덕션 배포는 아직. `.env` 프로덕션 값 점검 필요.
- **좋아요/조회수**: `PostListItem`의 `likeCount`는 항상 0(Like 모델이 Phase 2 보류라 실데이터 없음). `RecruitCard`의 `viewCount`/`bookmarkCount`도 항상 0 — 스키마에 없는 필드라 표시만 유지, 실카운트는 Phase 2.
- **승격 UX**: 승격 시 사용자가 내용을 검토/수정할 기회 없이 바로 생성됨. 원하면 승격 직후 `/recruit/new`로 값을 프리필해서 보내는 방식으로 바꿀 수 있음(지금은 편집 페이지가 없어 더 단순한 즉시 생성 방식 채택).
- **지원 메시지 UI**: `ApplyBar`가 한 줄짜리 인라인 폼이라 메시지가 길면 UX가 아쉬움. 다이얼로그로 분리하면 더 낫지만 지금은 스코프상 최소 구현.
- **발견해서 같이 고친 버그**: `error.tsx`는 Next.js에서 반드시 Client Component여야 하는데, 기존 `app/recruit/error.tsx`와 `app/components-test/page.tsx`가 서버 전용 쿠키 조회(`next/headers`)를 쓰는 `AppShell`을 client 트리에 그대로 import하고 있어서 **`npm run build`가 항상 실패하는 상태**였음(지금까지 `next dev`로만 확인해서 안 드러났던 것으로 보임). `error.tsx`들은 `AppShell` 대신 정적 마크업으로, `components-test`는 상호작용 부분만 별도 client 컴포넌트(`tag-filter-demo.tsx`)로 분리해서 고침. 새 `community/error.tsx`, `dashboard/error.tsx`도 처음부터 이 패턴으로 만듦.
