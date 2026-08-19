## 개요

좋아요/저장(북마크)/조회수 기능 배포 반영. MVP 배포(PR #2) 이후 첫 후속 기능으로, `dev`에서 이미 PR #3으로 검증되고 머지된 내용을 `main`(프로덕션)에 반영한다.

## 변경사항

- **스키마**: `RecruitBookmark`(모집 저장), `CommunityPostLike`(글 좋아요) 조인 테이블 신설 + `Recruit.viewCount` 필드 추가 (`CommunityPost.viewCount`는 이미 있었으나 미사용 상태였음)
- **액션**: `toggleRecruitBookmark`/`toggleCommunityPostLike`(버튼 클릭으로 바로 호출하는 토글) · `incrementRecruitViewCount`/`incrementPostViewCount`(상세 진입 시 조회수 증가)
- **컴포넌트**: `BookmarkButton`/`LikeButton` 신규, 모집·커뮤니티 상세 페이지에 배치
- `RecruitCard`/`PostListItem`에 이미 있던 조회수/저장/좋아요 아이콘을 실제 값에 연결 (하드코딩 0 제거)
- 모집 상세(`getRecruitById`)가 ISR 캐시라 저장 토글 직후 개수가 반영 안 되던 버그 수정 (`updateTag` 추가). 완전히 별도의 비로그인 세션으로 접속해 서버에 실제로 반영됐는지까지 검증함.

## 테스트

- `npx tsc --noEmit` 통과
- `npm run build` 통과
- `npm run e2e` — 18 passed / 1 skipped / 0 failed
- PR #3 (feat → dev) CI(Lint & Typecheck) green 확인 후 머지된 상태
