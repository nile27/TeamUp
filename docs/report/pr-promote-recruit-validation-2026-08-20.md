## Summary
- 실사용 중 발견한 버그 수정: 커뮤니티 글을 정식 모집으로 승격할 때(`promoteToRecruit`) zod 검증 없이 바로 `prisma.recruit.create`를 호출해서, 제목 5자/소개 10자 미만인 짧은 글도 그대로 모집글로 만들어졌음
- 이렇게 만들어진 모집글을 나중에 수정하려고 하면, 사용자가 손대지 않은 제목/소개가 현재 폼 검증(`createRecruitSchema`)에 걸려 저장이 막히는 문제로 이어짐 — "기존 데이터를 그대로 뒀는데 무시된다"는 증상으로 나타남
- 승격 시점에 `createRecruitSchema.pick({title, content})`로 미리 검증해서 차단, 친절한 에러 메시지로 리다이렉트
- 부수: `community.spec.ts`의 flaky selector(`getByText("팀원")`이 사이트 타이틀을 읽는 route announcer와도 매칭되던 문제) 수정

## Test plan
- [x] `npx tsc --noEmit`
- [x] `npx eslint`
- [x] `npm run build`
- [x] `npx playwright test` 전체 통과 (기존에 알려진 flaky 케이스도 이번에 함께 해결 확인)
- [x] DB에서 실제로 `promotedFromId`가 있는 짧은 제목/내용의 모집글로 원인 재현·확인

🤖 Generated with [Claude Code](https://claude.com/claude-code)
