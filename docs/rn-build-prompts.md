# RN 파일럿 착수 프롬프트 (①→②→③)

> 코드 에이전트에게 단계별로 전달. 전체 배경은 `docs/rn-pilot-plan.md` 참고.
> 공통 규칙: 허락 없이 git commit/push 금지, `.env` 직접 수정 금지, 커밋 메시지 추천만. 각 단계 끝 `docs/DEVLOG.md`에 기록.

---

## ① 웹에 REST API 라우트 신설 (`TeamUp/`, dev 브랜치)

TeamUp 웹(`/Users/immingyu/Desktop/TeamUp`)에 RN 앱이 호출할 얇은 REST API를 신설해줘. **웹 화면·렌더링(SSR/ISR)·기존 Server Action은 건드리지 말 것.** 기존 `features/*/queries.ts`·`actions.ts`·`lib/` 로직을 재사용해 라우트는 얇게.

만들 것 (`src/app/api/`):
- `GET /api/recruit` — 모집 목록(기술스택 필터 `?stack=` 지원). `features/recruit/queries.ts`의 `getRecruitList` 재사용.
- `GET /api/recruit/[id]` — 모집 상세(역할·지원수 포함). 없으면 404 JSON.
- `POST /api/recruit` — 모집 생성. `createRecruit` 로직 재사용, `completeness` 계산 포함.
- `POST /api/applications` — 지원. 중복지원 방지(`@@unique`), 비즈니스 로직은 기존 것 재사용.
- (선택) `GET /api/dashboard` — 내 모집/내 글/지원현황.

인증/규약:
- **Authorization: Bearer <supabase access token>** 헤더로 유저 식별. `server/supabase.ts` 방식으로 토큰 검증해 `user.id` 획득(RN이 Supabase 세션 토큰을 보냄). 미인증 시 401 JSON.
- 응답은 일관된 JSON 형태(`{ data }` / `{ error }`), 상태코드 정확히(200/201/400/401/404).
- 비즈니스 로직은 `lib/`·`features` 재사용만, 라우트엔 로직 중복 금지. zod로 입력 검증.

마무리: 각 엔드포인트 `curl` 또는 간단 테스트로 200/401/404 확인, `npx tsc --noEmit` 통과. API 계약(경로·요청·응답 예시)을 `docs/api-contract.md`로 정리(RN·추후 Spring이 공유할 기준).

---

## ② Expo 앱 스캐폴딩 (`TeamUp-mobile/`, 신규 레포)

`~/Desktop/TeamUp-mobile`에 새 Expo 앱을 만들어줘. 폴리레포(웹과 워크스페이스로 안 묶음). 배경·구조는 `TeamUp/docs/rn-pilot-plan.md` 2장 참고.

세팅:
- Expo(최신) + **Expo Router**(파일 기반 라우팅) + TypeScript.
- **NativeWind**(RN용 Tailwind) — `tailwind.config.js`에 디자인 토큰 주입: primary 앰버 `#FFA940`, 텍스트 먹색 `#2B2620`, 배경 흰색.
- **React Native Reusables**(shadcn RN 포트)로 기본 UI 컴포넌트.
- **@tanstack/react-query**(RN 데이터 훅), **@supabase/supabase-js**(+ expo-secure-store로 세션 저장).
- 디렉토리 구조는 `rn-pilot-plan.md`의 트리 그대로: `app/`(라우트 얇게), `src/features/`, `src/components/ui`, `src/lib`, `src/schema`, `src/server/supabase.ts`, `src/config`.
- `src/config`에 **API base URL**(웹 배포 주소 `https://team-up-olive.vercel.app` 또는 로컬) 환경변수로.
- `TeamUp/src/lib/completeness.ts`와 `features/*/schema.ts`(zod)를 `src/lib`·`src/schema`로 복붙(공유 패키지 X).

기본 뼈대:
- `app/_layout.tsx`: QueryClientProvider + Supabase 세션 컨텍스트 + 테마.
- `app/index.tsx`: 세션 보고 `(app)/recruit` 또는 `(auth)/login`으로 리다이렉트.
- `(auth)/`·`(app)/` 라우트 그룹 + `(app)/_layout.tsx`에 인증 가드 + 하단 탭(모집/대시보드) 자리만.
- 아직 화면 로직은 비우고 "빈 스크린 + 네비게이션 동작"까지만.

마무리: `npx expo start`로 안드로이드(Expo Go)에서 앱 뜨고 라우팅 되는지 확인. README에 실행법. `eas.json`에 **`internal` 배포 프로필**(안드로이드 APK) 미리 넣어둘 것.

---

## ③ 척추 화면 구현 (`TeamUp-mobile/`)

Expo 앱에 핵심 사용자 여정을 구현해줘. 순서대로, 각 단계 안드로이드에서 확인하며 진행. 데이터는 ①에서 만든 웹 API + Supabase Auth 사용.

1. **로그인/회원가입** (`(auth)/`): Supabase Auth SDK로 이메일 로그인/가입(+가능하면 구글/카카오). 세션은 secure store. 성공 시 `(app)`으로.
2. **모집 목록** (`(app)/recruit/index`): React Query로 `GET /api/recruit` 조회, 기술스택 필터, `RecruitCard`(RN 버전, 완성도 게이지·역할·태그). **빈/로딩(스켈레톤)/에러 3상태** 필수.
3. **모집 상세** (`(app)/recruit/[id]`): `GET /api/recruit/[id]`, 완성도 게이지·기획정보·역할. 로딩/에러 상태.
4. **지원 흐름**: 상세 하단 지원 버튼 → `POST /api/applications`(Bearer 토큰) useMutation. 중복지원 시 안내, 성공 시 "지원 완료" 상태. 낙관적 업데이트 권장.
5. (여유 시) **대시보드**: 지원한 모집 탭 — 웹↔앱 데이터 일관성 확인.

규칙:
- 웹 `features` 콜로케이션 감각 유지: `features/recruit/`에 `api.ts`·`queries.ts`·`mutations.ts`·`components/`.
- 색은 config 토큰 사용(하드코딩 금지), 앰버/먹 일치.
- 로직은 웹 API에, RN은 호출만(중복 구현 금지). `completeness`는 복붙한 순수 함수 재사용.

테스트/마무리:
- **Jest + jest-expo + React Native Testing Library**로 `completeness`·핵심 컴포넌트 유닛 테스트.
- **Maestro**로 척추 여정(로그인→목록→상세→지원) `.yaml` 플로우 1개 + AI 어서션(`assertWithAI`) 한두 개.
- `eas build -p android --profile internal`로 APK 뽑아 실기기 설치 확인, `eas update`로 OTA 갱신 확인.
- `docs/`(모바일 레포)에 완료 리포트 + 데모 스크린샷/녹화. 웹 `TeamUp/docs/DEVLOG.md`에도 한 줄.

완료 기준: `rn-pilot-plan.md` 5장(여정 완결·인증 재사용·웹↔앱 데이터 일관성이 필수 통과선).
