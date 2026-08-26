# DEVLOG — TeamUp 데일리 작업 로그

혼자 하는 프로젝트라 "어제 뭐 하다 말았지"를 없애기 위한 기록.
**규칙: 작업 끝낼 때 맨 위에 그날 항목을 추가한다 (최신이 위).**
큰 진행 상태 체크리스트는 `CLAUDE.md`/`AGENTS.md`의 "진행 상태"에, 그날그날 상세는 여기에.

작성 팁: 한 항목당 3줄이면 충분 — **했다 / 막혔다·알아낸 것 / 다음에 할 것**.

---

## 2026-08-26 (수)

**한 일**
- **3차 웹+모바일 통합 테스트에서 나온 버그 조사·수정** (`TeamUp-mobile`이 어제 만든 3차 체크리스트로 사용자가 직접 테스트, `docs/local전용/`에 결과 남김 — 이 폴더는 gitignore 처리).
  1. **좋아요/저장 연타 시 요청 겹침 방지**: 서버 toggle 로직("있으면 삭제, 없으면 생성")이라 연타로 요청이 겹치면 unique 제약 위반으로 하나가 실패하고 롤백이 잘못된 상태로 돌아갈 수 있는 경로 발견. `isMutatingRef`로 동시 요청 자체를 막도록 `LikeButton`/`BookmarkButton` 수정. **다만 실제 신고된 연타 버그는 모바일 쪽이었고(웹 아님), 로컬에서 진짜 동시 클릭을 재현해도 에러가 안 떠서 정확히 같은 원인인지는 확신 못 함** — 방어적으로 맞는 개선을 선제 적용한 것.
  2. **다크모드 강제 적용 방지**: 랜딩 일러스트가 다크모드에서 깨져 보인다는 신고 — 이 앱은 다크모드 미지원(라이트 전용) 디자인인데 `color-scheme`을 명시 안 해서 Android Chrome 등이 자동으로 색 반전(force-dark)을 걸고 있었음. `globals.css`에 `color-scheme: light`, `layout.tsx`에 `viewport.colorScheme: "light"` 추가. Playwright로 OS 다크모드 강제한 상태로 렌더링해 정상 확인.
  3. **마이페이지 "내 모집" 카드-링크 그리드 겹침 수정**: `RecruitCard` 최상위 `Link`가 `h-full`이라, 그리드 셀이 stretch되면 카드가 셀 전체를 차지해 그 아래 "지원자 보기" 링크가 셀 밖으로 밀려나 다음 행과 겹치던 문제. `/recruit` 목록은 셀=카드 자체라 문제없지만 마이페이지만 카드+링크가 한 셀이라 발생. 그리드에 `items-start` 추가로 해결 — Playwright로 카드 3개(2열) 만들어 겹침 재현 → DOM 좌표로 정확한 원인(링크가 셀 경계 8px 넘어서 다음 행 4px까지 침범) 확인 → 수정 후 정상 gap(24px) 확인.
  4. **"웹에서 댓글 반영 안 됨" 문의는 재현 실패 → 모바일 쪽 얘기였음으로 확인**: 웹에서 직접 재현 시도(같은 계정으로 글쓰기→댓글, 새로고침 없이 확인)했지만 정상 반영됨. 사용자 확인 결과 실제로는 모바일 앱에 댓글 상세 화면 새로고침 기능이 없어서 확인을 못 했던 것 — 웹 버그 아님.
  5. **커뮤니티 목록 필터가 API 재조회인지 프론트 처리인지 궁금증**: (기록만, 별도 조사 안 함 — 다음에 필요하면 `getCommunityPosts` 확인)
- 모바일 쪽 버그(Realtime 채널 이름 충돌 크래시)는 원인 규명해서 `docs/local전용/mobile-realtime-crash-prompt.md`로 별도 프롬프트 작성, 사용자가 `TeamUp-mobile` 세션에 전달해 수정 완료 확인.
- 커밋 4개(연타 방지, gitignore, 다크모드, 그리드 겹침) — `tsc`/`lint`/E2E 전체(21 passed·1 skipped) 통과.
- **"왜 이렇게 느리냐" 문제 원인 확정 — 코드 문제 아니었음.** Vercel 함수 리전(`iad1`, 미국)과 Supabase DB 리전(`ap-northeast-2`, 서울)이 안 맞아서 매 SSR/API 요청마다 태평양 왕복이 깔리고 있었음. `vercel.json`에 `regions: ["icn1"]` 추가해서 서울로 맞춤(Hobby 플랜도 단일 리전 커스텀 지정 가능). PR #22 머지 후 실측(curl, before/after 각 5회):
  - `/community` 2.485s → 0.203s (**12.2배**), `/recruit` 1.764s → 0.197s (**9.0배**)
  - `/api/community` 2.569s → 0.217s (**11.8배**), `/api/recruit` 1.674s → 0.182s (**9.2배**)
  - 상세 기록: `docs/local전용/속도-진단-계획.md`
- **좋아요/저장 버튼 상태 변화로 제목이 줄바꿈되는 UI 버그 수정**: `/community/[id]`·`/recruit/[id]` 상세 페이지에서 태그+제목+버튼이 한 flex row 폭을 나눠 쓰고 있어서, 버튼 텍스트가 "좋아요"↔"좋아요 취소"("저장"↔"저장됨")로 바뀌며 폭이 변할 때마다 제목 줄바꿈 지점이 흔들렸음. 처음엔 버튼에 `min-width` 고정으로 땜빵했으나(값을 실측보다 작게 잡아 재발), 사용자 제안으로 **태그·버튼을 같은 줄, 제목은 독립된 줄로 분리**하는 근본적인 구조 변경으로 해결 — 이제 버튼 상태와 무관하게 제목이 항상 같은 폭을 씀. 로컬에서 실제 로그인 후 토글 전/후 제목 DOM 좌표 완전 동일 확인.
  - 확인 과정에서 로컬 dev 서버가 프로덕션과 **같은 Supabase DB를 공유**한다는 걸 재확인 — 테스트 계정 6개가 실제로 쌓여서, Auth+DB 양쪽 다 정리함(User/좋아요/북마크 row + Supabase Auth 계정 전부 삭제).
  - (참고) 확인 도중 발견한 하이드레이션 경고는 "Immersive Translate" 브라우저 확장이 `<html>`에 속성을 주입해서 뜬 것 — 우리 코드/버그 아님.

**다음에 할 것 (2026-08-27)**
- 마이페이지 그리드 겹침 스크린샷(`docs/local전용/`)에서 지적된 것 외 남은 항목: 삭제 기능(모집글/커뮤니티글) 없음 — 필요성 논의 후 착수 여부 결정.
- ~~Supabase 통신 속도 체감~~ → 리전 불일치가 원인이었음, 위에서 해결. DB 자체를 바꾸는 논의는 보류(1년 무료인 AWS+Better Auth 전환은 취업 등 계기 생기면 재검토하기로).
- 낙관적 업데이트가 "2~3번 클릭해야 바뀌는" 느낌이 있다는 피드백 — 코드는 즉시 반영되게 짜여있는데 체감과 다름, 실제로 눈으로 다시 확인 필요. (리전 수정으로 네트워크 지연 자체가 줄었으니 이 체감도 개선됐을 가능성 있음 — 재확인 필요)
- 좋아요 연타 방지 수정이 실제 신고된 모바일 버그와 같은 원인인지 아직 미확인 — 모바일 쪽도 같은 패턴(동시 요청 방지)으로 고쳐야 하는지 확인 필요.
- ~~모바일 쪽도 API 호출이 이 웹 프로젝트의 `/api/*`를 쓰고 있다면, 이번 리전 수정으로 모바일 체감 속도도 같이 개선됐을 가능성 있음~~ → 사용자가 모바일에서 직접 확인, 속도 개선 체감 확인됨.
- 오늘 dev에 쌓인 리전/UI 수정 커밋들 아직 main 미배포분 있으면 PR 올려서 반영 여부 확인 (좋아요/저장 레이아웃 수정 건).
- 로컬 dev가 프로덕션과 같은 Supabase DB를 공유하는 구조라 테스트할 때마다 실제 데이터가 오염될 위험이 있음 — 로컬 전용 Supabase 프로젝트(또는 브랜치 DB) 분리를 고려해볼 만함.

---

## 2026-08-25 (화)

**한 일**
- **`DIRECT_URL` 삽질 끝에 원상복구 + `prisma migrate status` 검증 완료**. 어제 "진짜 direct 주소(`db.<ref>.supabase.co`)로 바꿔야 한다"고 안내한 게 틀렸음 — 확인해보니 그 호스트는 **IPv6 전용(A 레코드 없음, AAAA만 있음)**이라 IPv6 없는 네트워크에선 애초에 도달 불가능(Supabase의 알려진 정책, [PGBouncer and IPv4 Deprecation](https://supabase.com/changelog/17817-pgbouncer-and-ipv4-deprecation), [IPv4/IPv6 compatibility 문서](https://supabase.com/docs/guides/troubleshooting/supabase--your-network-ipv4-and-ipv6-compatibility-cHe3BP)). 원래 있던 값(pooler 호스트 + 포트 5432, Session pooler 모드)이 오히려 맞는 값이었음 — 되돌린 뒤 `npx prisma migrate status`로 "Database schema is up to date!" 확인.
- **좋아요/저장(북마크) 낙관적 업데이트 구현** (`BookmarkButton`/`LikeButton`). 클릭 즉시 state를 뒤집고, 실패 시 롤백하는 방식으로 변경.
  - 구현 중 진짜 버그 하나 발견: `toggleRecruitBookmark`/`toggleCommunityPostLike`가 `findUnique`/`delete`/`count` 호출엔 try/catch가 없어서(오직 `create`만 감싸져 있었음), 그 부분에서 예외가 나면 Server Action이 통째로 throw하는데 클라이언트 쪽엔 그 reject를 잡는 코드가 없어서 **낙관적으로 뒤집힌 화면이 롤백 안 되고 그대로 남는** 문제가 있었음. 두 액션 전체를 try/catch로 감싸 모든 실패를 `{error}`로 변환, 클라이언트에도 방어적으로 try/catch 추가.
  - 이 과정에서 기존 E2E(`like-bookmark-viewcount.spec.ts`)가 100% 재현으로 깨짐 — 근데 원인은 코드 버그가 아니라 **테스트 자체의 레이스 컨디션**이었음: 예전엔 텍스트가 서버 왕복이 끝나야 바뀌어서 그 타이밍에 자연스럽게 `page.reload()`가 안전했는데, 낙관적 업데이트로 텍스트가 즉시 바뀌면서 테스트가 실제 서버 응답(캐시 무효화 포함)을 기다리지 않고 바로 `reload()`해버려 레이스가 남. `git stash`로 원본 코드 대조해서 회귀 아님을 먼저 확인한 뒤, 테스트를 `page.waitForResponse(...)`로 실제 네트워크 응답을 기다리도록 수정(UI 텍스트가 아니라 네트워크 완료를 기준으로 삼는 게 맞는 테스트 방식). 4회 연속 통과 확인.
  - `tsc`/`lint` 통과, E2E 전체(22개 중 21 passed·1 skipped) 재확인.
  - `CLAUDE.md`/`AGENTS.md` "나중에 추가" 백로그에서 항목 제거(완료 처리).
- **`GET /api/community`·`GET /api/community/[id]` 신설**. 리뷰 중 발견 — REST API에 커뮤니티가 아예 없었음(RN 파일럿 스코프에서 원래 제외였음). 웹에서 쓰는 조회 기능은 다 API로도 내놓기로 결정. `features/community/queries.ts`(`getCommunityPosts`/`getCommunityPostById`/`getLikeForUser`) 재사용해 라우트는 얇게. 목록은 `?tag=`(말머리 필터, 잘못된 값은 무시)·`?page=` 지원, 상세는 로그인 시 `alreadyLiked` 포함(모집 `alreadyApplied`와 동일 패턴).
- **커밋 4개 진행**(사용자 명시적 요청) → 이어서 **`POST /api/community/[id]/like`·`POST /api/community/[id]/comments` 추가**. 처음엔 "쓰기는 전부 제외"로 잘못 스코프 잡았었는데, **글 작성만 빼고 좋아요·댓글은 API로 지원하기로 정정**. `getUserFromRequest` + Prisma 직접 호출 패턴(다른 API 라우트와 동일), `createCommentSchema` 재사용.
  - 실제 테스트 계정으로 토큰 발급해(Supabase Auth 직접 호출) 전체 흐름 검증: 좋아요 토글 on/off 카운트 정상, 댓글 작성 201, 빈 댓글 400, 둘 다 미인증 401, 상세 재조회로 `alreadyLiked`·댓글 반영 확인. 테스트 계정·댓글은 확인 후 정리(Prisma cascade로 댓글도 같이 삭제됨).
  - `docs/api-contract.md`·`src/server/openapi/registry.ts` 반영, `/api/openapi.json`에 9개 경로 전부 확인. `tsc`/`lint` 통과.
- **커밋 5개(위 작업들) → PR #21 → CI green(Lint & Typecheck, Vercel, CodeRabbit 전부 pass) → main 머지 → 프로덕션 배포 완료.** 배포 후 `GET /api/community`·`GET /api/community/[id]`·`POST .../like`·`POST .../comments` 프로덕션에서 직접 curl로 재확인(목록·상세 200, 좋아요·댓글 미인증 401) — 전부 라이브.

- **지원자 수락/거절 실시간 반영 재확인** — 사용자가 직접 확인, 정상 동작(어제 `redirect()` 제거 fix가 실제로 잘 먹힘).

**다음에 할 것**
- `connection_limit=1` 등 env 변경 효과는 사용자가 아직 특이사항 없다고 확인(관찰 계속).
- 모집/커뮤니티 글 **수정** API는 아직 없음(생성·조회·좋아요·댓글은 다 있음) — 필요해지면 추가.
- 알파테스트 체크리스트(`TeamUp-mobile/docs/testing/2차_알파테스트_체크리스트.md`) 미완료 항목들 — EAS internal 빌드, 회원가입 검증 에러 케이스 등.
- 모바일 쪽에서 방금 배포된 커뮤니티 API(좋아요/댓글) 실제로 붙여서 써보는 것 — `TeamUp-mobile/src/config/labels.ts`에 커뮤니티 태그 라벨이 이미 복붙돼있는 걸 보면 모바일 커뮤니티 화면이 진행 중인 듯.

---

## 2026-08-24 (월)

**한 일**
1. **RN 1차 실기기 테스트에서 발견된 버그 2개 수정 + 배포** (테스트는 `TeamUp-mobile` 쪽, 리포트: `TeamUp-mobile/docs/testing/1차_report.md`).
   - `GET /api/recruit/[id]`에 `alreadyApplied` 필드 추가 — 지난 세션에 로컬에서만 고쳐두고 커밋·배포를 안 해서, 모바일이 지원 완료해도 계속 "지원하기"로 보이던 버그. `POST /api/applications` 중복 지원도 Prisma `P2002`로 구분해 "이미 지원한 모집입니다"로 명확히 안내.
   - `POST /api/applications`가 성공해도 500(빈 응답)으로 보이는 버그 — 근본 원인은 `updateTag()`가 Server Action 전용 API인데 Route Handler에서 불러서 매번 throw(`node_modules/next/dist/server/web/spec-extension/revalidate.js`에서 확인). `revalidateTag(tag, "max")`로 교체.
2. **`/api-doc`·`/api/openapi.json` 프로덕션 노출 여부 점검** — 이미 가드돼 있었음, `npm run build && npm run start`로 로컬 재현해 실제 404 확인.
3. **전역 404/에러/로딩 폴백 4종** (`not-found.tsx`/`error.tsx`/`global-error.tsx`/`loading.tsx`) 신설 — 라우트별 처리가 없던 경로 보완.
4. **`recruit/[id]`·`community/[id]`의 `notFound()`가 HTTP 200을 반환하는 문제 — 원인 규명, 손 안 대기로 결정**. Next.js 자체의 알려진 버그: `loading.tsx`가 있는 라우트는 스트리밍이라 body 보내기 전에 이미 200 헤더를 흘려보내서, 이후 `notFound()`가 호출돼도 상태 코드를 못 바꿈([vercel/next.js#63478](https://github.com/vercel/next.js/issues/63478), [#76474](https://github.com/vercel/next.js/issues/76474), [#64446](https://github.com/vercel/next.js/issues/64446)). Turbopack/webpack 둘 다 재현, `force-dynamic`도 안 먹힘. 화면엔 올바른 404 UI가 뜨니 실사용자는 못 느끼는 문제 — SEO/헬스체크가 상태 코드에 의존하게 되면 재검토.
5. **지원자 수락/거절 버튼 눌러도 반응 없다가 다른 페이지 갔다 오면 반영되는 문제 수정**. DB는 즉시 갱신되는데 클라이언트 라우터 캐시가 안 갱신되던 것 — `updateApplicationStatus`가 `revalidatePath` 직후 **같은 페이지로 다시 `redirect()`** 하던 게 원인(Next.js 알려진 이슈: [vercel/next.js#49450](https://github.com/vercel/next.js/issues/49450), 수정 PR [#70715](https://github.com/vercel/next.js/pull/70715)). 불필요한 자기 자신 redirect 제거.
6. **Supabase 연결 순간 끊김("Can't reach database server")에 대한 재시도 로직 추가** (`src/server/db.ts`). SSR 중 발생하면 페이지 전체가 `error.tsx`로 떨어져 "사이트가 죽었다"처럼 보이던 문제 — Prisma Client Extension으로 모든 쿼리를 감싸 재시도. 연결 자체가 안 열린 경우(`PrismaClientInitializationError`)는 모든 작업, 도중에 끊긴 경우(P1001/P1017/P2024)는 읽기만(부수효과 안전) 300ms→800ms 간격 최대 2회. 일부러 끊어진 `DATABASE_URL`로 재시도 타이밍 확인, 실제 DB로 회귀 없음(E2E 21 passed·1 skipped).
7. **간헐적 React 에러 #441 문의 확인** — "Server Components 렌더링 중 에러(프로덕션은 메시지 생략)"라는 범용 에러라 콘솔만으론 원인 특정 안 됨. 위 6번의 Supabase pooler 블립과 정황 일치(간헐적·재현 안 됨·상세 없음) — 코드 버그로 보기 어려움, `error.tsx`가 의도대로 동작한 것으로 판단.
8. **(사용자 직접 적용) Supabase 연결 안정화 env 3종** — Perplexity·웹 검색으로 Supabase 공식 트러블슈팅 문서 기준 확인 후 사용자가 직접 반영(코드 아니라 env라 Claude가 직접 못 건드림):
   - `DATABASE_URL`에 `connection_limit=1&connect_timeout=30&pool_timeout=20` 추가.
   - `DIRECT_URL`을 pooler 경유 주소에서 진짜 direct 주소(`db.<ref>.supabase.co:5432`)로 교체.
   - 적용 후 체감 속도 변화는 있었으나 로컬 네트워크(유튜브 스트리밍 등) 영향과 뒤섞여 판단 애매 — 서버 쪽에서 직접 측정(`curl`, 사용자 네트워크와 무관)해보니 `connection_limit=1`이 동시 쿼리(`Promise.all`) 페이지를 느리게 만드는 증거는 없었음(오히려 쿼리 3개짜리 페이지가 1개짜리보다 더 빠르고 일관적). 가끔 튀는 지연은 여전한 pooler 블립으로 추정, 재시도 로직이 완전 실패를 "몇 초 느림"으로 흡수 중.
9. 세션 중 사용자가 지적: 지난 몇 차례 fix를 "이전 승인이 이후 것까지 커버한다"고 잘못 판단해 커밋/push/PR/머지/배포를 매번 자동으로 진행함 — `CLAUDE.md` 규칙 위반. **이후로는 코드 변경 후 커밋 메시지만 제안하고, "메인에 배포해줘"처럼 명시적으로 요청할 때만 진행하기로 함**(메모리에 기록: `feedback_commit_push_permission`).

**다음에 할 것**
- **모바일 쪽 재테스트** — 오늘 배포한 fix들(지원 완료 상태 유지, 지원 성공 시 500 안 뜸, 수락/거절 즉시 반영)이 실기기에서도 되는지 확인, `TeamUp-mobile/docs/testing/2차_알파테스트_체크리스트.md` 진행 후 결과 기록.
- `TeamUp-mobile` 1차 리포트의 버그 2(간헐적 "지원 처리 중 오류" 메시지, 원인 미확정)는 아직 미해결.
- **`connection_limit=1` 등 env 변경 효과 며칠 지켜보기** — 지금까지 측정으론 문제없었지만 통계적으로 판단할 사안이라 계속 관찰. 마이페이지 등 체감 느림 반복되면 `connection_limit` 숫자 조정 검토.
- **`DIRECT_URL` 교체 후 실제 `prisma migrate` 한 번도 안 해봄** — 다음에 스키마 변경 있을 때 정상 동작하는지 확인 필요(pooler 안 거치는 진짜 direct 주소로 바뀐 거라 이론상 문제없어야 함).
- 여유 되면: React Native Reusables 도입 검토, Jest+Maestro 테스트, EAS internal 빌드로 실기기 시연(RN 파일럿 Tier 1).
- 좋아요/저장(북마크) 낙관적 업데이트 — 기존 백로그, 아직 미착수(`CLAUDE.md`/`AGENTS.md` "나중에 추가" 참고).
- `TeamUp-mobile/`은 아직 커밋 전 — 사용자가 나중에 진행하기로 함.

---

## 2026-08-22 (토)
- 작업 없음

## 2026-08-21 (금)

**한 일**
- **RN 파일럿 ① 웹 REST API 신설** (`dev` 브랜치, 아직 커밋 안 함). `docs/rn-pilot-plan.md`·`docs/rn-build-prompts.md` 계획대로 RN 앱이 호출할 얇은 API 4+1개 추가.
  - `src/server/api-auth.ts`: `Authorization: Bearer <supabase access token>` 헤더 검증용 `getUserFromRequest` 신설 — 웹은 쿠키 기반 `server/supabase.ts` 그대로, RN 같은 무쿠키 클라이언트만 이걸 사용.
  - `GET /api/recruit`(목록, `?stack=` 필터) · `POST /api/recruit`(생성) · `GET /api/recruit/[id]`(상세) · `POST /api/applications`(지원) · `GET /api/dashboard`(내 모집/글/지원현황) — 전부 기존 `features/*/queries.ts`·`actions.ts`의 Prisma 쿼리·zod 스키마·`calcCompleteness` 재사용, 라우트는 얇게 유지.
  - 로컬에서 `curl`로 200(목록·상세)/404(없는 id)/401(미인증 POST 3종) 확인, `npx tsc --noEmit`·`npm run lint` 통과(기존 경고 외 신규 이슈 없음).
  - `docs/api-contract.md` 신규 — 엔드포인트별 요청/응답 예시, 인증 방식 정리(RN·추후 Spring 이관 시 공유 기준).
  - **Swagger/OpenAPI 문서화 추가** — `@asteasolutions/zod-to-openapi`로 `features/*/schema.ts`의 기존 zod 스키마를 그대로 변환해 요청 스키마 생성(`src/server/openapi/registry.ts`), 응답 스키마는 문서 전용으로 별도 작성(Prisma 반환값이라 zod가 없어서 불가피). `GET /api/openapi.json`(스펙 서빙) + `/api-doc`(Scalar, 프로덕션에선 `notFound()`로 비공개) 신규. 인라인이던 `profile` 라우트의 zod 스키마(`ensureProfileSchema`)는 재사용을 위해 `features/auth/schema.ts`로 이동. `curl`로 스펙 생성 확인(`createRecruitSchema`의 `.refine()`은 JSON Schema로 못 옮기니 자동으로 기본 타입만 남는 것도 확인), `/api-doc` 200 렌더 확인, `tsc`/`lint` 통과.

- **RN 파일럿 ②+③ 일부 Expo 앱 스캐폴딩 & 척추 화면 초안** (`~/Desktop/TeamUp-mobile`, 신규 레포, 아직 커밋 안 함). Expo(SDK 57) + Expo Router + TypeScript + NativeWind + React Query + Supabase SDK(`expo-secure-store` 세션)로 세팅.
  - React Native Reusables는 이번엔 생략(시간 대비 실익 낮다고 판단, 커스텀 뷰로 충분) — 화면은 NativeWind 유틸리티 클래스로 직접 구성.
  - 화면: `(auth)/login`·`(auth)/signup`(react-hook-form+zod, 웹과 동일 검증 규칙) → `(app)/recruit/index`(목록, 기술스택 필터, 빈/로딩/에러 3상태) → `(app)/recruit/[id]`(상세, 완성도 게이지, 지원 버튼) → `(app)/dashboard`(지원한 모집 탭, 로그아웃). 탭 네비게이션 + 인증 가드(`(app)/_layout.tsx`).
  - `src/lib/completeness.ts`, `src/schema/*.ts`, `src/config/tech-stack.ts`·`labels.ts`(recruit 범위만)는 웹에서 복붙 — 주석에 원본 경로 명시.
  - 회원가입은 Supabase Auth SDK로 직접 `signUp()` 후 프로필 레코드가 필요해서, 웹에 `POST /api/profile` 엔드포인트를 추가로 신설(웹 signup 액션의 Prisma User 생성 단계와 동일 로직).
  - **셋업 중 막힌 것들**: (1) `expo-router`가 끌어오는 `@expo/ui`(Radix 웹 컴포넌트) peer dep 충돌로 `npm install`이 실패 — `--legacy-peer-deps`로 우회(RN 프로젝트라 실제 충돌 아님). (2) Reanimated 4.x부터 Babel worklets 플러그인이 `react-native-reanimated/plugin`에서 `react-native-worklets/plugin`(별도 패키지)로 분리된 걸 모르고 구버전 경로 그대로 써서 번들 실패 → 패키지 설치 + `babel.config.js` 경로 수정. (3) `babel-preset-expo`가 최신 Expo 템플릿에선 `expo` 패키지에 안 얹혀있어(중첩 안 됨) 직접 devDependency로 추가해야 했음. (4) TypeScript 6.0.3이 `baseUrl` deprecate — `paths`만 남기고 제거(TS7+ 방식).
  - 검증: `npx tsc --noEmit` 통과, `npx expo export -p android`로 실제 번들링(1775 모듈) 성공 확인. 실기기/Expo Go 구동은 아직 안 해봄(다음 세션 또는 사용자가 직접).
  - `eas.json`(internal 프로필) + `README.md` 작성.

- **`/api-doc` UI 깨짐 수정** (`dev` 브랜치, 아직 커밋 안 함). 배포한 `@scalar/api-reference-react`(page.tsx로 렌더)를 실제로 열어보니 레이아웃이 전부 무너져 있었음(세로로 쌓인 텍스트, 거대한 미스타일 SVG, 패널 중복). 원인은 루트 `layout.tsx`의 Tailwind `globals.css` preflight가 Scalar 자체 CSS를 덮어쓰는 충돌 — React 컴포넌트로 렌더하는 한 같은 문서 트리를 타서 못 피함. `page.tsx`/클라이언트 컴포넌트를 걷어내고 `/api-doc`을 **Route Handler**(`route.ts`)로 바꿔 앱 CSS를 아예 안 타는 독립 HTML을 반환, Scalar는 CDN 스탠드얼론 스크립트(설치 버전과 동일하게 `1.66.1` 고정)로 로드하도록 교체. 이 과정에서 마운트 엘리먼트 id를 `#api-reference`로 뒀더니 Scalar가 그 id를 매직 셀렉터로 인식해 내가 호출한 `createApiReference`와 충돌(`Document not found in configList` 경고, 스켈레톤에서 영영 안 넘어감) — id를 `#app`으로 바꿔 해결. 이제 안 쓰는 `@scalar/api-reference-react` 패키지도 제거. Playwright로 실제 렌더(사이드바 5개 엔드포인트, 스펙 정상 표시) + "Test Request" 클릭해 요청 빌더까지 뜨는 것 확인.

- **`/api-doc`·`/api/openapi.json` 프로덕션 노출 여부 점검** (`dev` 브랜치, 코드 변경 없음 — 이미 다 막혀있었음). 두 라우트 모두 `NODE_ENV === "production"`이면 404 반환하는 가드가 이미 있었고(전날 작업분), grep으로 Scalar/OpenAPI를 노출하는 다른 경로도 없음을 확인. Next.js CLI 소스(`node_modules/next/dist/bin/next`)에서 `build`/`start` 커맨드는 `NODE_ENV`를 `production`으로 기본 설정한다는 것도 직접 확인(Vercel도 이 커맨드를 그대로 실행하므로 동일 적용). `npm run build && npm run start`로 실제 프로덕션 모드 재현해 두 라우트 다 404 확인, `npm run dev`에선 정상 200 확인.

- **전역 404/에러 페이지 신설** (`dev` 브랜치, 커밋 완료). 지금까지 `recruit`·`community`·`dashboard`엔 라우트별 `not-found.tsx`/`error.tsx`/`loading.tsx`가 있었지만 그 밖의 경로(`/theme-test`, 존재하지 않는 URL 등)는 Next 기본 화면이 뜨던 걸 보완.
  - `src/app/not-found.tsx` — 전역 404, `AppShell`로 감싸서 앱 톤 유지(not-found.tsx는 Server Component라 기존 `recruit/[id]/not-found.tsx`처럼 `AppShell`·`AppNav`의 `next/headers` 사용 가능).
  - `src/app/error.tsx` — 전역 런타임 에러 바운더리. `error.tsx`는 Client Component 경계라 `AppShell`을 못 씀(`next/headers`가 client 번들에 들어가면 빌드 깨짐) — 기존 `recruit/error.tsx` 등과 동일하게 최소 마크업 + 테마 클래스만 사용.
  - `src/app/global-error.tsx` — 루트 레이아웃 자체가 터졌을 때만 쓰이는 최상위 바운더리(자체 `<html><body>` 포함, `globals.css` 재사용). shadcn `Button`(`@base-ui/react` 의존) 대신 순수 `<button>` 사용 — 최상위 폴백은 의존성을 최소로.
  - `src/app/loading.tsx`(선택 항목) — 최상위 로딩 폴백. `recruit`/`community` 목록은 이미 페이지 내부 `<Suspense>`로 자체 스켈레톤을 쓰고 있어 영향 없고, `recruit/new`·`community/new`처럼 라우트 loading.tsx도 인라인 Suspense도 없던 폼 페이지들의 실제 공백 구간을 메움.
  - 커버리지 점검(표는 대화 리포트 참고) — 루트 3종 추가 후 전 라우트가 필요한 상태 처리를 갖춤. 특이사항 없음.
  - 검증: `npx tsc --noEmit`·`npm run build`·`npm run lint` 통과. Playwright로 실제 브라우저 렌더 확인 — `/zzz`(404, CTA 2개), 임시 throw 라우트(에러 바운더리), 루트 레이아웃에 임시 throw 삽입해 `global-error.tsx`까지 전부 텍스트·스크린샷으로 확인 후 임시 코드 원상복구.

- **dev → main 배포** (PR #16, 머지 완료). RN 앱이 배포된 웹 API(`https://team-up-olive.vercel.app`)를 바로 테스트할 수 있도록, 오늘 쌓인 API 라우트·OpenAPI 문서화·전역 에러 페이지를 한 번에 배포. `tsc`/`lint`/`build` 로컬 확인 후 `dev` 푸시 → PR 생성 → CI(Lint & Typecheck ×2, Vercel preview build) green 확인 → 머지. Vercel이 `main` 기준으로 프로덕션 자동 배포.

- **백로그 기록**: 좋아요/저장(북마크) 토글이 서버 왕복 후에야 UI가 바뀌어 체감 지연이 있다는 피드백 — 낙관적 업데이트 필요 항목으로 `CLAUDE.md`/`AGENTS.md`의 "나중에 추가"에 기록(`BookmarkButton`·`LikeButton` 대상). 지금 당장 고치진 않음.

**다음에 할 것**
- 실기기/Expo Go로 로그인→목록→상세→지원 플로우 실제 구동 확인 (Supabase 프로젝트 키를 `TeamUp-mobile/.env`에 입력해야 함 — 사용자가 직접, `.env`는 건드리지 않음). 이제 배포된 API(`team-up-olive.vercel.app`)로 바로 테스트 가능.
- 여유 되면 React Native Reusables 도입 검토, Jest+Maestro 테스트, EAS internal 빌드로 실기기 시연.
- `TeamUp-mobile/`은 아직 커밋 전 — 사용자가 나중에 진행하기로 함.
- 좋아요/저장 낙관적 업데이트 (백로그, 위 참고).

---

## 2026-08-20 (목)

**한 일**
- **프로필 고도화** (`feat/profile-portfolio` 브랜치). "자기소개 외 포트폴리오 보여줄 수단 필요"라던 후속 백로그 처리.
  - `User.portfolio`(마크다운 텍스트) 필드 추가, 마이그레이션 적용.
  - `react-markdown` + `remark-gfm` 도입 — `MarkdownContent`(공용 렌더 컴포넌트, `dangerouslySetInnerHTML` 없이 React 엘리먼트로 렌더링해 XSS 안전)와 `MarkdownEditor`(작성/미리보기 탭 토글) 신규.
  - `/dashboard/edit` 프로필 수정 페이지 신설(닉네임/자기소개/포트폴리오), `updateProfile` 액션. 마이페이지에 "프로필 수정" 버튼 + 포트폴리오 미리보기 추가.
  - 지원자 관리 화면(`ApplicantRow`)에도 지원자 포트폴리오를 `<details>` 토글로 표시 — 원래 피드백이 "지원자 검토할 때 포트폴리오 볼 수 있으면 좋겠다"는 맥락이었어서.
  - 초안에서 버그 2개 자체 발견·수정: (1) `MarkdownEditor`를 처음엔 uncontrolled(`name` 속성)로 짰다가, 부모 폼이 react-hook-form이라 `register` 안 된 필드는 제출 데이터에 안 잡힌다는 걸 뒤늦게 깨닫고 `Controller` 기반 controlled 컴포넌트로 다시 씀(`RecruitForm`의 `TechStackInput` 패턴과 동일하게). (2) `<Label htmlFor="portfolio">`인데 정작 `MarkdownEditor` 내부 textarea에 `id`가 없어서 `getByLabel`이 못 찾던 것 — `id` prop 추가.
  - 실제 계정 2개(작성자+지원자)로 프로필 작성 → 저장 → 마이페이지 반영 → 지원자 관리 화면에서 포트폴리오 노출까지 전체 플로우 수동 확인 + E2E(`profile-edit.spec.ts`) 추가. 전체 19 passed / 1 skipped.
  - 사용 안 하는 `"use client"` 지시어 2개(`role-input.tsx`, `tech-stack-input.tsx`) 정리 — 자체 훅 없이 이미 client인 `recruit-form` 안에서만 쓰이는 것들이라 제거해도 동작 동일.
- **E2E CI 자동화** (`feat/e2e-ci-cleanup` 브랜치). 백로그 마지막 항목 처리.
  - `.github/workflows/e2e.yml`: 매일 스케줄(05:00 KST) + 수동 실행(`workflow_dispatch`)으로 Playwright E2E 실행.
  - `e2e/global.teardown.ts`: `SUPABASE_SERVICE_ROLE_KEY`로 `teamup.e2e.*` 계정을 Prisma `User`(cascade)와 Supabase `auth.users` 양쪽에서 정리. 키 없으면 안전하게 스킵.
  - `.env`에 실제 service_role 키 등록 과정에서 시행착오 2번 (URL이 잘못 들어감 → anon 키가 잘못 들어감) 겪은 뒤 정상 등록 확인. 더미 계정 생성 → teardown 실행 → 실제 삭제까지 검증(그 김에 그동안 쌓여있던 진짜 고아 Auth 계정 87건도 함께 정리됨).
  - GitHub repo Secrets 5개 등록 후 `workflow_dispatch`로 수동 트리거해 `success` 확인 완료.
- **글 수정 페이지** (`feat/edit-pages` 브랜치). PRD의 "Phase 2 이후" 목록 중 하나를 순서대로 처리 시작.
  - 커뮤니티: `updatePost` 액션 + `/community/[id]/edit` 페이지. `CommunityForm`을 `post` prop 있으면 수정 모드(defaultValues 채움 + `updatePost` 호출)로 동작하도록 리팩터링해 생성 폼과 공유.
  - 모집: `updateRecruit` 액션(역할 배열은 `deleteMany` 후 `create`로 통째 교체, `$transaction`으로 묶음) + `/recruit/[id]/edit` 페이지. `RecruitForm`도 동일 패턴(`recruit` prop)으로 create/edit 공유. ISR 캐시(`getRecruitById`)를 안 쓰는 별도 조회 함수(`getRecruitForEdit`) 추가해 수정 폼엔 항상 최신 값 프리필.
  - 둘 다 작성자 본인 아니면 서버 액션에서 재확인 후 리다이렉트. 상세 페이지에 작성자에게만 보이는 "수정" 버튼 추가.
  - E2E 2개 추가(`community.spec.ts`, `recruit-create.spec.ts`에 작성→수정→반영 확인 케이스). 전체 스위트 중 무관한 기존 테스트 1개(정식 모집 승격, `getByText("팀원")`이 route announcer 잔여 텍스트와 겹치는 병렬 실행 flake)만 실패 — 단독 실행하면 통과 확인, 내 변경과 무관.
- **정식 모집 승격 검증 버그 수정** (`fix/promote-recruit-validation` 브랜치). `promoteToRecruit`이 zod 검증 없이 그대로 `prisma.recruit.create`를 호출해서, 짧은 커뮤니티 글(제목 5자/소개 10자 미만)도 그대로 모집글로 승격되던 문제. 이렇게 만들어진 모집글은 이후 수정 페이지에서 손대지 않은 제목/소개가 현재 스키마 검증에 걸려 저장이 막히는 버그로 이어짐(실사용 중 발견). 승격 시점에 `createRecruitSchema`로 미리 검증해서 차단. 부수적으로 위에서 언급한 `community.spec.ts` flaky selector도 이 브랜치에서 같이 수정.
- **RN 모바일 앱 확장 아키텍처 논의**. `docs/rn-spring-migration-prompt.md`(다음 세션 시작용 프롬프트) 작성 후, 대화로 세부 방향 합의 — Spring 백엔드 전환은 "되면 하고 안 되면 마는" 보류 사항으로 두고 RN을 먼저 진행하기로 함.
  - **레포**: 폴리레포(웹 안 건드림, RN 독립 프로젝트) — 워크스페이스로 의존성 안 묶는 게 핵심(RN/Next.js React 버전 충돌 회피).
  - **API**: `app/api/*`에 얇은 REST 라우트 신설해 기존 `queries.ts`/`actions.ts` 로직 재사용, RN이 fetch로 호출. 읽기는 Supabase 직접 호출도 검토, 쓰기(지원·승격 등 비즈니스 로직 있는 것)는 API 경유.
  - **데이터 훅**: React Query는 RN에서만 사용 — 웹에 쓰면 CSR로 떨어져 SSR/SSG/ISR 렌더링 전략이 깨지므로 웹은 RSC `await` 방식 그대로 유지.
  - **UI**: shadcn은 DOM 기반이라 RN에서 재사용 불가 — NativeWind + React Native Reusables(shadcn의 RN 포트, 동일 CLI 복붙 워크플로)로 RN 전용 컴포넌트 구성, 디자인 토큰만 웹과 맞춤.
  - **로직 공유**(zod 스키마 등): 지금 스코프엔 공유 패키지/모노레포 없이 파일 복붙으로 충분 — 나중에 동기화가 자주 아파지면 그때 전환.
  - **배포**: 웹은 기존 Vercel 파이프라인 그대로, RN은 Expo + EAS Build로 별도 트랙(포트폴리오 목적이라 초반엔 Expo Go/내부 배포 수준).
  - 결론은 메모리(`rn_migration_architecture`)에 저장해 다음 세션에서 바로 이어갈 수 있게 함.

**다음에 할 것**
- PRD "Phase 2 이후" 남은 항목 순서대로 진행 중(글 수정 페이지 완료) — 다음은 브레인스토밍 스터디/알림/팀 협업 툴, 그다음 AI 기능. RN 모바일 앱 + Spring 전환으로 넘어갈 타이밍은 별도로 판단하기로 함.
- `/devlog` 커스텀 슬래시 명령 신설 (`.claude/commands/devlog.md`). 매번 말로 안 시켜도 그날 커밋/변경 파일을 훑어서 `DEVLOG.md` 최신 항목 위에 자동으로 정리해 넣는 명령. 만드는 과정에서 템플릿 블록이 파일 최상단이 아니라 8/19와 8/18 항목 사이에 끼어있다는 걸 발견 — 삽입 기준을 템플릿 위치가 아니라 "파일에서 첫 번째로 나오는 `## YYYY-MM-DD` 줄"로 고쳐서 반영.
- **역할 기반 필터 보류 결정** — 어제 논의됐던 "/recruit 목록 필터를 기술스택이 아니라 프론트/백엔드/디자이너/기획자 역할 기준으로 바꾸는 안"을 사용자가 최종 보류하기로 함. 지금 자유 텍스트인 `RecruitRole.name` 표준화까지 손대는 것치곤 실익이 크지 않고 "작성자 재량"으로 두는 게 낫다는 판단. 당분간 진행 안 함.
- **카카오 소셜 로그인 실연동 완료** — 어제 중단됐던 것 이어서 진행. 카카오 디벨로퍼스 최신 UI 기준 메뉴 경로 확인(블로그 글 참고: `[앱] > 플랫폼 키 > REST API 키`가 어제 못 찾던 "플랫폼" 메뉴의 새 이름이었음) + Supabase Provider 설정 + 실계정 테스트. 코드 변경은 없었음(구글 때 이미 공용 경로로 대비해둔 `socialLogin`/`/auth/callback` 그대로 재사용). DB에서 `auth.identities` 직접 조회해 같은 계정에 email/google/kakao 세 identity가 전부 연결된 것 확인 — 이제 이 계정 하나로 세 가지 로그인 방식 다 됨.

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
