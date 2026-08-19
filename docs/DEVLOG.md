# DEVLOG — TeamUp 데일리 작업 로그

혼자 하는 프로젝트라 "어제 뭐 하다 말았지"를 없애기 위한 기록.
**규칙: 작업 끝낼 때 맨 위에 그날 항목을 추가한다 (최신이 위).**
큰 진행 상태 체크리스트는 `CLAUDE.md`/`AGENTS.md`의 "진행 상태"에, 그날그날 상세는 여기에.

작성 팁: 한 항목당 3줄이면 충분 — **했다 / 막혔다·알아낸 것 / 다음에 할 것**.

---

## 2026-08-19 (수)

**한 일**
- **소셜 로그인(구글) 실연동 완료** (`feat/social-login-hardening` 브랜치). 코드는 이전부터 있었지만 Provider 미설정 상태였던 것.
  - 코드 리뷰하면서 버그 2개 발견·수정: (1) OAuth 실패 시 `/login?error=...`로 리다이렉트되는데 로그인 폼이 `error` 쿼리를 안 읽어서 실패해도 무반응이던 것 → 배너로 안내. (2) 카카오는 비즈니스 채널 연동 전엔 이메일 동의항목을 못 받아 `email`이 빈 값으로 올 수 있는데, `User.email`이 `@unique`라 빈 문자열로 두 명 이상 가입하면 충돌하던 잠재 버그 → auth id 기반 고유 이메일로 대체.
  - 사용자 우려사항(이메일 가입 계정 + 나중에 구글 로그인 시 중복 계정 생기는지) 확인 — Supabase의 automatic identity linking(같은 이메일, 양쪽 인증됨 → 자동 병합)이 기본 동작이라 문제없음을 설명. 혹시 몰라 그 자동 병합이 실패하는 예외 상황(Prisma email unique 충돌)에 대한 방어 코드도 추가 — 조용히 실패해 "로그인은 됐는데 프로필 없는" 반쪽 상태로 남는 대신 세션 정리 후 안내 메시지로 로그인 페이지로.
  - Google Cloud Console에 OAuth 클라이언트 등록(사용자가 직접 진행, 기존 프로젝트에 TeamUp 전용 Client ID만 추가) + Supabase Provider 설정 + 실제 구글 계정으로 로그인 테스트.
  - **실제 검증**: 기존 이메일 계정(`ddj03104@gmail.com`)과 같은 Gmail로 구글 로그인 시도 → DB에서 `auth.identities` 직접 조회해 같은 `user_id`에 `email`/`google` identity가 둘 다 연결된 것 확인(중복 계정 안 생김, 자동 병합 정상 동작).
  - 카카오는 Provider 설정 전(코드는 준비돼있어 나중에 동일 흐름으로 진행 가능). 오늘 시도했으나 Kakao Developers 콘솔 UI가 최근에 개편돼서 "플랫폼" 메뉴 위치를 못 찾음 → **시간 부족으로 중단, 내일 이어서**.
- **기술스택 프리셋 전환** (`feat/tech-stack-preset` 브랜치). 자유 텍스트 입력(`TechStackInput`, Enter로 태그 추가)이 "React"/"React.js"/"ReactJS"처럼 같은 기술이 다른 태그로 쪼개지는 문제가 있어서, 고정 프리셋(`config/tech-stack.ts`, 5개 카테고리 26개 항목)에서만 클릭으로 고르도록 전환. `TechStackUrlFilter`(모집 목록 필터)도 같은 프리셋을 공유해서 목록에 있던 별도의 9개짜리 목록과 통일. 서버 스키마(`createRecruitSchema`)에도 프리셋 밖 값 거부하는 `refine` 검증 추가(클라이언트 우회 방지). 모집 유형 워딩 논의하다가 나온 "역할 기반 필터(프론트/백엔드/디자이너/기획자)"로 바꾸는 안은 `RecruitRole.name`도 자유 텍스트라 같은 표준화 문제가 있어서 보류, 이번엔 기술스택만 먼저 처리.
- **좋아요/저장/조회수 기능 구현** (MVP 배포 후 첫 후속 기능, `feat/like-bookmark-viewcount` 브랜치에서 작업). Phase 2로 미뤄뒀던 것 중 사용자가 우선순위로 선택.
  - 스키마: `RecruitBookmark`(모집 저장), `CommunityPostLike`(글 좋아요) 조인 테이블 신설 + `Recruit.viewCount` 필드 추가(`CommunityPost.viewCount`는 이미 있었는데 미사용 상태였음). 마이그레이션 적용.
  - `toggleRecruitBookmark`/`toggleCommunityPostLike` — 버튼 클릭으로 바로 호출하는 토글 액션(폼이 아니라 `useTransition` + 직접 호출 패턴, `social-buttons.tsx`와 동일 스타일). `incrementRecruitViewCount`/`incrementPostViewCount` — 상세 페이지 진입 시 호출.
  - `BookmarkButton`/`LikeButton` 컴포넌트 신규, 모집·커뮤니티 상세 페이지에 배치. `RecruitCard`/`PostListItem`은 이미 있던 아이콘 UI에 실제 값만 연결(하드코딩 0 제거).
  - 실제 계정으로 토글→새로고침 반복 테스트하다가 버그 발견: 모집 저장 개수가 새로고침 후 0으로 리셋됨 — `getRecruitById`가 ISR 캐시(`unstable_cache`)라 토글 직후 `updateTag`를 안 불러서 캐시된 개수가 안 바뀌고 있었음. `applyToRecruit`과 동일하게 `updateTag(recruit-${id})` 추가해서 해결. 커뮤니티 좋아요는 상세가 SSR이라 애초에 이 문제 없었음.
  - E2E(`like-bookmark-viewcount.spec.ts`) 추가 — 자기 계정으로 모집·글을 직접 만들어 저장/좋아요/조회수를 검증하는 자기완결형 테스트. 전체 18 passed / 1 skipped 재확인.
  - 배포 전 Prisma client를 재생성했는데 이미 떠있던 dev 서버가 예전 클라이언트를 메모리에 물고 있어서 "Unknown field bookmarks" 에러가 났던 것도 확인 — dev 서버 재시작으로 해결(스키마 변경 후엔 재시작 필요하다는 걸 기억해둘 것).
- 사용자가 직접 둘러보며 찾은 버그 3개 수정:
  1. **완성도 게이지 시각 버그** — `CompletenessGauge`의 `[&>div]:bg-[#FFA940]`가 실제 인디케이터(폭 %)가 아니라 Progress의 트랙(직계 자식 div)을 amber로 칠해버려서, 값이 몇 %든 막대가 항상 꽉 찬 것처럼 보였음. 불필요한 오버라이드라 제거(기본 `bg-primary`가 이미 amber라 그대로 정상 동작).
  2. **마이페이지(구 대시보드) "지원한 모집"이 갱신 안 되는 문제** — `applyToRecruit`/`createRecruit`/`createPost`가 `/dashboard` 경로를 `revalidatePath` 안 해서, 지원·모집등록·글쓰기 후 클라이언트 라우터 캐시가 남아있던 `/dashboard`를 스킵하고 보여줌(하드 리로드하면 정상). 세 액션 모두에 `revalidatePath("/dashboard")` 추가.
  3. **모집 상세 페이지가 짧은 글일 때 하단 지원바가 붕 뜨는 문제** — sticky bottom bar가 페이지 높이를 채우지 못해 콘텐츠 바로 아래 어중간하게 위치했음. `min-h-[calc(100vh-3.5rem)] flex flex-col` 래퍼로 감싸서 짧은 글도 지원바가 뷰포트 하단에 붙게 수정.
- "대시보드" → "마이페이지"로 라벨 변경(경로 `/dashboard`는 그대로). AppNav·LandingHeader·dashboard/error.tsx·관련 E2E 셀렉터까지 같이 수정.
- 시드 데이터가 생기면서 깨진 E2E 1개(`recruit-list.spec.ts`) 수정 — 필터 칩 텍스트가 카드 안 기술스택 태그와 겹쳐서 모호해짐, `data-testid="tech-stack-filter"`로 범위 좁힘. 전체 16 passed / 1 skipped 재확인.
- 사용자가 화면을 둘러보며 남긴 나머지 피드백 중 사용자가 우선순위로 고른 2가지 처리:
  1. **지원자 관리 기능 신설** (PRD 3.4 "작성자는 대시보드에서 지원자 확인" — 원래 MVP 범위인데 빠져있던 것). `/recruit/[id]/applicants` 페이지 신설(작성자 본인만 접근 가능, `notFound`/`redirect`로 방어) — 지원자 닉네임·이메일·자기소개(bio)·지원메시지 확인 + 수락/거절 버튼. `updateApplicationStatus` 액션(작성자 본인 검증 후 상태 변경). 진입점 2곳: 모집 상세 `ApplyBar`("지원자 확인하기 (N)"), 마이페이지 "내 모집" 탭 카드 아래("지원자 보기 (N)"). 지원자는 자기 마이페이지 "지원한 모집" 탭에서 수락/거절 결과를 그대로 봄(기존 컴포넌트 재사용, 별도 알림 없이도 결과 확인 가능). 실제 계정 2개로 지원→수락→마이페이지 반영까지 전체 플로우 수동 확인 + E2E(`recruit-applicant-management.spec.ts`) 추가.
  2. **모집 유형 워딩 변경** — "개발자 모집"/"기획자 모집"(누가 누구를 찾는지 헷갈림) → "개발자 구해요"/"기획자 구해요"로 변경. 하드코딩돼 중복돼있던 곳(`/recruit` 목록, `RecruitForm` 유형 토글)도 `config/labels.ts`의 `RECRUIT_TYPE_LABEL` 하나로 통일.
- 시드 데이터가 생기면서 깨진 E2E 1개(`recruit-list.spec.ts`) 수정 — 필터 칩 텍스트가 카드 안 기술스택 태그와 겹쳐서 모호해짐, `data-testid="tech-stack-filter"`로 범위 좁힘. 전체 17 passed / 1 skipped 재확인.
- 나머지 기획성 피드백(기술스택 입력방식, 프로필/포트폴리오, 좋아요·저장)은 이번엔 보류 — 아래 "다음에 할 것"에 남겨둠.
- **🎉 배포 완료 — MVP 성공 기준(PRD.md 7장) 5개 전부 충족.**
  - `.env.example`이 `.gitignore`의 `.env*`에 걸려 한 번도 커밋된 적 없던 것 발견·수정(`!.env.example` 예외 추가), `NEXT_PUBLIC_SITE_URL` 변수 문서화.
  - `dev` → `main` PR(#2) 문서 작성(`docs/report/pr-dev-to-main-2026-08-19.md`) 및 생성.
  - PR의 GitHub Actions "Lint & Typecheck" 실패 확인 → 이전부터 있던 eslint 에러 4개(`any` 타입 3곳, `login-form.tsx`의 effect 내 setState) 수정. `signupSuccess`를 effect+state 대신 `searchParams`에서 렌더 중 직접 파생하는 방식으로 바꿔 해소.
  - CI green 확인 후 PR #1(공용 컴포넌트 단계), PR #2(오늘까지의 전체 작업) 모두 `main`에 머지됨.
  - **https://team-up-olive.vercel.app 실서비스 접속 확인** — 랜딩/로그인/모집목록 200 응답, 타이틀 정상.

**막힌 것 / 알아낸 것**
- Server Action에서 `revalidatePath`/`updateTag`는 "현재 페이지"뿐 아니라 그 요청과 무관한 다른 경로도 명시적으로 넘겨줘야 함 — 안 그러면 그 경로를 클라이언트 라우터 캐시가 들고 있을 때(예: 지원 전에 마이페이지를 먼저 봤던 세션) 새 데이터가 하드 리프레시 전까진 안 보임. 여러 화면에 파생 영향 주는 mutation(지원·모집작성·글작성)은 관련된 모든 경로를 다 나열해야 안전함.
- `updateApplicationStatus`처럼 **같은 URL로 다시 redirect하는 Server Action**은 E2E에서 `waitForURL`로 완료 시점을 못 잡음(이미 그 URL이라 즉시 통과해버림) — 실제 DOM 변화(상태 텍스트 등)를 직접 기다려야 함.
- E2E 테스트에서 `<Button render={<Link/>}>`는 role이 여전히 `"button"`이라 새로 추가한 "지원자 확인하기" 링크도 `getByRole("button", ...)`로 셀렉트해야 함(어제 겪은 것과 동일 패턴, 계속 반복되니 팀 컨벤션으로 기억해둘 것).

**다음에 할 것 (내일 이어서 — 카카오부터)**
- **카카오 로그인 ← 여기부터 이어서**. 구글과 코드는 동일하게 재사용(별도 작업 불필요, `socialLogin("kakao")` 이미 있음), 외부 설정만 남음:
  1. Kakao Developers(developers.kakao.com) → 내 애플리케이션에서 TeamUp 앱 찾기(오늘 만들었으면 그거, 아니면 새로 추가)
  2. **"플랫폼" 메뉴 위치를 오늘 못 찾음** — UI가 개편된 것 같음. 왼쪽 사이드바에서 앱 안으로 들어간 뒤 "앱 설정" 그룹 아래 찾아보거나, 검색 기능 있으면 "플랫폼"/"Platform"으로 검색. 안 보이면 플랫폼(Web 도메인) 등록은 필수 아니니 건너뛰고 "카카오 로그인" 메뉴로 바로 가도 됨.
  3. **카카오 로그인** 메뉴에서 활성화 ON + Redirect URI 등록: `https://dvsagusafilxyvwetvwu.supabase.co/auth/v1/callback`
  4. 동의항목: 이메일은 선택 동의로 두되, 코드에서 이미 이메일 없는 경우 대비돼있음(auth id 기반 대체 이메일)
  5. 앱 키 → REST API 키 복사 (Client ID로 씀), 카카오 로그인 → 보안 → Client Secret 코드 생성
  6. Supabase 대시보드 → Authentication → Providers → Kakao에 Client ID/Secret 입력 → Save
  7. 로컬에서 "카카오로 계속하기" 실테스트 → 성공하면 구글 때처럼 `feat/social-login-...` 브랜치로 커밋/PR/배포
  - 막히면 화면 스크린샷 찍어서 보여주면 바로 짚어줄 수 있음.
- **프로필 고도화** — 자기소개 외에 포트폴리오/이력을 보여줄 수단(마크다운 에디터 등). 구조화 폼 4문항도 부족할 수 있다는 의견.
- **역할 기반 필터** — 기술스택 프리셋 작업 중 논의됐다가 보류된 것(`RecruitRole.name`도 자유 텍스트라 표준화 필요). 프론트/백엔드/디자이너/기획자로 목록 필터 단순화하는 안.
- 이 외 원래 목록: `screens-report`/`e2e-report`의 P2/P3, E2E CI화 시 Auth 계정 정리. (Vercel 배포·좋아요/저장/조회수·기술스택 프리셋·구글 로그인은 완료 — 위 참고)

---

## 템플릿 (복사해서 위에 붙여넣기)

```
## YYYY-MM-DD (요일)
**한 일**
-
**막힌 것 / 알아낸 것**
-
**다음에 할 것 (내일의 나에게)**
-
```

---

## 2026-08-18 (화)

**한 일**
- 로그인 후 헤더 미반영 버그 수정(랜딩 `LandingHeader`가 auth 상태를 안 봤음) + 로그인/회원가입/소셜버튼 에러를 toast에서 폼 인라인 배너로 통일 + Supabase 이메일 열거 방지 응답으로 인한 중복 이메일 미검출 버그 수정 + 회원가입 비밀번호 복잡도(영문·숫자·특수문자) 검증 추가. `feat/auth` → `dev` 머지.
- `docs/code-agent-prompt.md` 지시대로 남은 화면 전체 구현: 모집 상세(`/recruit/[id]`, ISR)·작성(`/recruit/new`, 기획자 3종 장치) / 커뮤니티 목록·상세·작성(+댓글+승격) / 대시보드(`/dashboard`). `completeness.ts`, 지원(`applyToRecruit`, 중복지원 방지), 커뮤니티→모집 승격(`promoteToRecruit`) 로직 포함.
- `npx tsc --noEmit` + `npm run build` 통과 확인 과정에서 기존 버그 발견·수정: `error.tsx`(Client Component)가 `AppShell`(서버 `cookies()` 사용하는 `AppNav` 포함)을 임포트해 프로덕션 빌드가 깨지고 있었음 — `/recruit/error.tsx`(기존)·`components-test` 페이지도 동일 문제라 같이 고침.
- `docs/e2e-test-prompt.md` 지시대로 Playwright E2E 세팅 + 7개 스펙(`auth`/`recruit-create`/`recruit-list`/`recruit-apply`/`community`/`dashboard`/`states`) 작성, `global.setup.ts`로 작성자A·지원자B storageState 재사용. 16 passed / 1 skipped(글 10개 이하라 페이지네이션 미노출, 정상) / 0 failed로 안정화. 실제 기능 버그는 못 찾았고(P1 없음), 테스트 세팅 과정에서 발견한 것들은 `docs/report/e2e-report-2026-08-18.md` 참고.
- `prisma/seed.ts` 작성 — 화면 채우기용 더미 데이터(로그인 불가 계정) 6명 + 모집 10개(완성도 0~100% 편차) + 커뮤니티 글 6개(그 중 1개는 모집으로 승격됨) + 댓글 5개 + 지원 6건. `npm run prisma db seed`로 실행, 재실행해도 `@teamup.local`/`[SEED]` 기준으로 정리 후 재생성돼 중복 안 쌓임(2회 연속 실행해서 확인). `/recruit`·`/community`·상세 페이지에 정상 노출 확인. `/dashboard`는 시드 유저가 로그인 불가라(의도됨) 시드 데이터가 보이진 않음 — 대시보드는 실제 로그인한 계정 기준으로만 채워짐.
- 랜딩 링크/버튼 다수 미동작 버그 수정: `components/landing/*`에서 쓰는 `brand-amber`/`brand-ink`/`brand-sky` 등 브랜드 색상 클래스가 `globals.css` `@theme`에 한 번도 등록된 적이 없어서 전부 무효 클래스였음 — 그래서 "둘러보기" 버튼 hover가 `hover:bg-brand-ink`(무효) + `hover:text-white`만 먹어서 흰 글자가 흰/투명 배경 위에 묻혀 안 보였던 것. `globals.css`에 `--color-brand-*` 토큰 등록해서 랜딩 전체 색상 정상화. 겸사겸사 헤더 nav(팀 찾기/아이디어 랩/커뮤니티/소개)와 히어로 "시작하기"/"둘러보기", "프로젝트 시작하기", "기획자 가이드 보기"가 전부 `href="#"`나 아무 동작 없는 `<button>`이었던 것도 실제 라우트(`/recruit`, `/community?tag=IDEA`, `/signup`, `/recruit/new`, `#about` 스크롤)로 연결.

**막힌 것 / 알아낸 것**
- 이 프로젝트가 Next.js 16(캐노리 계열) — `revalidateTag`가 이제 2번째 인자(`profile`)를 요구해서 Server Action 안에서 즉시 재검증할 땐 `updateTag(tag)`를 대신 써야 함. ARCHITECTURE.md의 `next: { tags: [...] }` 예시는 `fetch()` 기준이라 Prisma 조회엔 `unstable_cache(fn, [key], { tags })`로 감싸는 방식을 씀.
- `error.tsx`/`global-error.tsx`는 반드시 Client Component라 서버 전용 데이터(쿠키·DB) 쓰는 `AppShell`을 못 씀 — 로컬 정적 마크업으로 대체함. 새 에러 바운더리 만들 때 주의.
- `src/proxy.ts`(Next 16의 middleware) 존재를 이번에 처음 제대로 봄 — 로그인된 유저의 `/login`·`/signup` 접근을 `/`로 튕겨냄. Confirm email이 꺼져있어 회원가입 즉시 세션이 생기는 지금 환경에선, 회원가입 후 "/login?signup=success"의 완료 배너를 볼 새도 없이 곧장 "/"로 튕겨서 로그인 상태가 됨(E2E로 처음 드러난 동작 — 기능은 정상, UX 의도와는 미묘하게 다름).
- Base UI(`@base-ui/react`) `Button`에 `render={<Link/>}`를 줘도 `useButton()`이 접근성 role은 `"button"`으로 강제함 — `getByRole("link", ...)`가 아니라 `getByRole("button", ...)`로 셀렉트해야 함. `Badge`는 상호작용 role이 아예 없어서(`<span>`) `getByText`로 선택해야 함.
- Supabase는 서비스 롤 키 없이는(`.env` 직접 수정 금지라 추가 안 함) E2E가 만든 Auth 계정을 정리할 방법이 없음 — Prisma `User`(앱 프로필) 쪽은 `teamup.e2e.` 이메일 기준으로 정리했지만 `auth.users`엔 고아 계정이 남음.

**다음에 할 것 (내일의 나에게)**
- 랜딩 나머지 점검: 오늘 브랜드 컬러(`brand-*`)·주요 CTA는 고쳤지만, 페이지 전체를 쭉 훑으면서 다른 죽은 링크/색 깨짐 없는지 한 번 더 확인. 특히 푸터의 "이용약관"·"개인정보처리방침"·"고객센터"는 아직 `href="#"`로 남겨둠(해당 페이지 자체가 없어서) — 실제로 필요하면 페이지부터 만들지, 링크를 없앨지 결정.
- 반응형 점검 (모바일 폭에서 `/recruit/new`, 대시보드 탭, 오늘 고친 랜딩 CTA 줄바꿈 등 실제로 확인 안 함).
- Vercel 배포 + 프로덕션 환경변수 점검.
- 소셜 로그인(구글/카카오) Supabase Provider 설정 + 실테스트 (보류 중이던 항목).
- `docs/report/screens-report-2026-08-18.md` 참고해서 미완 항목(좋아요, 조회수 실카운트 등 Phase2 범위) 확인.
- `docs/report/e2e-report-2026-08-18.md`의 P2/P3 목록 검토 — 특히 "회원가입 완료 배너가 미들웨어에 막혀 안 보임" 여부 결정.
- E2E를 CI 등에서 정기적으로 돌릴 계획이면 `SUPABASE_SERVICE_ROLE_KEY` 추가 + `global.teardown.ts`로 Auth 고아 계정 자동 정리 검토.
- 시드 데이터(`prisma/seed.ts`)로 채운 `/recruit`·`/community` 목록을 실제로 브라우저에서 쭉 훑어보고 완성도 게이지·역할 뱃지·기술스택 태그가 의도대로 다양하게 보이는지 눈으로 확인 (지금까진 curl/스크린샷 일부만 확인함).

---

## 2026-08-17 (일)

**한 일**
- 진행 상황 전면 점검 — 실물 코드 기준으로 인증(폼·actions·schema·`/login`·`/signup`·`/auth/callback`)은 사실상 완성, 모집은 진행 중(컴포넌트 5개 + `/recruit` 목록, 상세/작성 페이지 남음), 커뮤니티·대시보드는 미착수임을 확인. 마지막 커밋은 8/11.
- CLAUDE.md·AGENTS.md "진행 상태" 체크리스트를 실제에 맞게 최신화 — 인증 완료 표시, "지금 여기" 마커를 모집으로 이동.
- 매일 새벽 3시 자동 DEVLOG 정리 스케줄 작업 신설(`teamup-daily-devlog`) — 그날 git 커밋 + 파일 변경을 훑어 이 파일 맨 위에 자동 기록. 작업 없는 날도 "작업 없음"으로 남김. 커밋/푸시는 안 함.

**막힌 것 / 알아낸 것**
- "회원가입 눌러도 DB에 아무것도 안 생긴다" 재확인 → 코드 문제 아님. `public.User` insert/select/delete 왕복이 정상 동작(DB 연동 살아있음), `Recruit.techStack` 컬럼도 DB 반영 확인. 원인은 여전히 Supabase 쪽 설정(가짜 이메일 거부 + Confirm email ON).
- 커밋 안 된 변경이 쌓여 있음: `CLAUDE.md`, `AGENTS.md`, `src/features/auth/actions.ts`, 신규 `docs/DEVLOG.md`. 다음에 정리 커밋 필요.

**다음에 할 것 (내일의 나에게)**
- Supabase Authentication → Email → **"Confirm email" 끄고** 진짜 이메일로 회원가입 실테스트 → `auth.users` + `public.User` 양쪽 행 생성 확인.
- 모집 ★핵심 마무리: 상세(`/recruit/[id]`, ISR)·작성(`/recruit/new`) 페이지.
- 쌓인 변경 정리 커밋(docs/체크리스트/actions.ts).

---

## 2026-08-13 (목)

**한 일**
- shadcn 테마 주입 완료 — `globals.css :root`에 DESIGN.md 앰버(#FFA940)/먹(#2B2620) 팔레트 주입, `--font-sans` Pretendard 우선으로. 확인용 `/theme-test` 페이지 있음(삭제 가능).
- 기술 스택 태그 기능 설계·반영 — `Recruit.techStack String[]` 필드 + GIN 인덱스 추가(마이그레이션 DB 반영 확인됨). 카드 표시·검색 필터가 같은 필드 공유. `TechStackInput`/`TechStackTags` 컴포넌트 존재. SCHEMA.md·COMPONENTS.md 갱신.
- auth 파트 코드 리뷰 — 폼의 `'use client'`는 서버 액션과 충돌 아님(정상 패턴). 다만 ①버튼에 하드코딩 색(`bg-[#FFA940]`) 규칙 위반, ②서버 에러를 `useActionState` 대신 toast로 처리(문서 규칙과 다름) 2개 발견. 수정 프롬프트 준비함(아직 미적용).
- 진행 상태 실측 점검 — 인증은 사실상 완성(폼·액션·페이지·콜백), 모집은 진행 중, 커뮤니티/대시보드는 미착수. 체크리스트가 뒤처져 있어 최신화함.

**막힌 것 / 알아낸 것**
- **회원가입 눌러도 DB에 아무것도 안 생김** → 연동 문제 아님. Supabase auth 로그에 `400 email_address_invalid` (test@gmail.com). 원인: ①가짜 테스트 이메일을 Supabase가 거부, ②"Confirm email"이 켜져 있음(`user_confirmation_requested`). auth.users에도 안 남으니 그 뒤 Prisma insert도 당연히 안 돎.
- DB 연동 자체는 정상 확인 — `public.User` insert/select/delete 왕복 성공. Prisma 대상 프로젝트(dvsagusafilxyvwetvwu, ap-northeast-2) 맞음. `Recruit.techStack` 컬럼도 DB에 반영돼 있음.
- 참고: 지금 signup 액션은 Confirm email ON이어도 확인 전에 Prisma User를 즉시 생성함. 확인 메일 흐름 유지할 거면 프로필 생성을 콜백/DB 트리거로 옮기는 게 깔끔(2순위).

**다음에 할 것 (내일의 나에게)**
- Supabase 대시보드 → Authentication → Email → **"Confirm email" 끄고** 진짜 이메일로 회원가입 실테스트 → `auth.users` + `public.User` 양쪽에 행 생기는지 눈으로 확인.
- auth 하드코딩 색 제거(안전, 바로 가능) + `useActionState` 전환(폼 구조 변경) — 준비해둔 프롬프트로 진행.
- 모집: 상세 페이지(`/recruit/[id]`, ISR)·작성 페이지(`/recruit/new`, StructuredForm+RoleInput+TechStackInput) 마무리.
- 그다음 커뮤니티 착수(현재 `post-list-item.tsx`만 있음).
