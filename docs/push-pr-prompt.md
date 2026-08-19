# 코드 에이전트 프롬프트 — 좋아요/저장/조회수 기능 push + PR

> 아래 전체를 코드 에이전트에게 그대로 전달하세요.

---

TeamUp 레포에서 `feat/like-bookmark-viewcount` 브랜치를 push하고, `dev`로 PR을 만들어줘.

## 상태
- 브랜치: `feat/like-bookmark-viewcount` (로컬에만 있음, origin에 아직 안 올라감)
- 베이스: `dev`
- 커밋 1개: `4c42c65 feat: 좋아요/저장(북마크)/조회수 기능 추가`
- 로컬에서 `npx tsc --noEmit`, `npm run build`, `npm run e2e` 모두 통과 확인된 상태(18 passed / 1 skipped).

## 할 일
1. `git push -u origin feat/like-bookmark-viewcount`
2. `gh pr create --base dev --head feat/like-bookmark-viewcount`로 PR 생성. 제목/본문은 아래 "PR 본문" 섹션을 그대로 사용(파일로 만들어 `--body-file`로 넘기는 것 추천).
3. PR 생성 후 `gh pr checks <번호>`로 CI(Lint & Typecheck 등) 결과 확인.
   - 실패하면 `gh run view <run-id> --log-failed`로 원인 확인 → 로컬에서 고치고 커밋 → push → 재확인. (참고: 이 레포는 이전에 `any` 타입, effect 내 setState 같은 기존 eslint 에러들 때문에 CI가 막힌 적이 있었음. 새로 추가한 코드에서 비슷한 게 없는지 특히 확인.)
4. CI green 확인되면 여기서 멈추고 사용자에게 보고. **머지는 사용자 승인 후에만 진행** — 먼저 merge하지 말 것.

## PR 제목

```
feat: 좋아요/저장(북마크)/조회수 기능 추가
```

## PR 본문

```markdown
## 개요

Phase 2로 미뤄뒀던 좋아요·저장·조회수 기능 구현. `RecruitCard`/`PostListItem`에 이미 있었지만 하드코딩 0으로 죽어있던 아이콘 UI에 실제 값을 연결했다.

## 변경사항

- **스키마**: `RecruitBookmark`(모집 저장), `CommunityPostLike`(글 좋아요) 조인 테이블 신설 + `Recruit.viewCount` 필드 추가 (`CommunityPost.viewCount`는 이미 있었으나 미사용 상태였음)
- **액션**: `toggleRecruitBookmark`/`toggleCommunityPostLike`(버튼 클릭으로 바로 호출하는 토글, 폼이 아님) · `incrementRecruitViewCount`/`incrementPostViewCount`(상세 진입 시 조회수 증가)
- **컴포넌트**: `BookmarkButton`/`LikeButton` 신규, 모집·커뮤니티 상세 페이지에 배치
- **버그 수정**: 모집 상세(`getRecruitById`)가 ISR 캐시라 저장 토글 직후 `updateTag`를 안 불러서 새로고침해도 개수가 리셋되던 버그 발견·수정. 완전히 별도의 비로그인 세션으로 접속해 개수가 정확히 반영되는지까지 검증함(클라이언트 상태가 아니라 서버에 실제로 반영됐는지 확인). 커뮤니티 좋아요는 상세 페이지가 SSR이라 이 문제 자체가 없었음.

## 테스트

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run e2e` — 18 passed / 1 skipped / 0 failed (`like-bookmark-viewcount.spec.ts` 신규 추가)
```

## 주의
- `.env` 수정 금지
- 허락 없이 `main`으로의 머지나 `dev` PR 자체의 머지는 하지 말 것 (PR 생성 + CI 확인까지만)
- Prisma 7 업그레이드 금지
