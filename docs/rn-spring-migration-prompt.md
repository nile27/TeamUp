# 새 세션 시작 프롬프트 — RN 앱 + Spring 백엔드 전환 착수

TeamUp(`/Users/immingyu/Desktop/TeamUp`)은 Next.js(App Router) 풀스택 MVP로 이미 완성돼 `https://team-up-olive.vercel.app`에 배포돼 있어. 이제 PRD에서 "Phase 2 이후"로 미뤄뒀던 **RN 모바일 앱 + Java Spring 백엔드 전환**을 시작하려고 해.

## 먼저 읽어야 할 문서
- `docs/PRD.md` — 서비스 개요, Phase 2 항목 목록(99~101줄)
- `docs/ARCHITECTURE.md` — 특히 "10. Phase 2 전환 지점" 섹션. 지금 코드가 이 전환을 대비해서 `queries.ts`(읽기)/`actions.ts`(쓰기)로 로직을 분리해둔 이유가 여기 적혀있어.
- `docs/SCHEMA.md` — 특히 "Phase 2 전환 메모(Spring + MySQL)" 섹션. Prisma → JPA/MyBatis, PostgreSQL → MySQL, Supabase Auth → Spring Security 전환 시 고려사항.
- `CLAUDE.md` (루트) — 프로젝트 전체 규칙. 특히 커밋 컨벤션, `.env` 절대 직접 안 건드리는 규칙, git 브랜치 전략(기능마다 브랜치)은 Spring/RN 쪽 작업에도 그대로 적용해줘.

## 지금까지 구조 요약
- 로직이 `features/<도메인>/queries.ts`(조회) + `actions.ts`(Server Action, 변경)에 모여있어서, Spring 이관 시 이 둘이 Spring 서비스 계층 하나에 대응하는 그림으로 설계돼 있음.
- DB: Prisma 6 + Supabase(PostgreSQL). `Recruit.embedding`처럼 Phase 2(AI 매칭)용으로 미리 자리 잡아둔 nullable 필드도 있음.
- 인증: Supabase Auth(이메일 + 구글/카카오 소셜 로그인 실연동 완료).

## 이 세션에서 할 일
전환 작업은 스코프가 커서(플랫폼 자체가 바뀜) 바로 코드부터 짜지 말고, **설계/스코프 합의부터** 시작해줘. 최소한 아래 질문들을 사용자와 먼저 정리하고 나서 계획을 세워:

1. **레포 구조**: Spring 백엔드를 이 레포 안에 서브폴더로 둘지, 완전히 새 레포로 뺄지. RN 앱도 마찬가지.
2. **전환 범위**: 처음부터 전체 API를 Spring으로 옮길지, 아니면 일부 도메인(예: 모집 하나)부터 파일럿으로 옮기고 검증할지.
3. **DB 마이그레이션**: Supabase(PostgreSQL) 그대로 Spring에서 붙일지(JPA로 PostgreSQL 계속 사용), 아니면 SCHEMA.md에 적힌 대로 진짜 MySQL로 옮길지 — 이거에 따라 일정이 크게 달라짐.
4. **인증 전환 시점**: Supabase Auth → Spring Security(JWT) 전환을 Next.js 쪽엔 언제 반영할지(웹은 그대로 Supabase Auth 쓰고 RN만 Spring JWT 쓰는 과도기가 있을 수 있음).
5. **RN 프로젝트 초기화**: Expo 쓸지 bare RN인지, 화면은 기존 Next.js 페이지 목록(`docs/ARCHITECTURE.md` 폴더 구조 참고)을 그대로 따라갈지.

이 질문들에 대한 답이 다 나오기 전엔 실제 구현(Spring 프로젝트 생성, RN 프로젝트 생성 등)에 들어가지 말고, 정리된 계획을 먼저 보여줘.

## 참고 — 이 프로젝트의 일하는 방식
- 기능 단위로 `feat/<이름>` 브랜치 파서 작업 → PR → CI(Lint & Typecheck, Vercel) 통과 확인 → `dev`에 머지. `dev`가 어느 정도 쌓이면 `dev → main` PR로 실서비스 배포. (Spring/RN 레포가 분리되면 이 워크플로가 그대로 적용 안 될 수 있으니, 레포 구조 정할 때 CI/배포 전략도 같이 정해줘.)
- 커밋 메시지는 Conventional Commits + 한국어 요약 (`feat: ...`, `fix: ...` 등), `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` 포함.
- `git push`나 `commit`은 사용자 허락 없이 하지 말 것 — 이건 이 프로젝트의 명시적 규칙.
