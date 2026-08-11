# COMPONENTS.md — 컴포넌트 분리

10개 페이지에서 반복 요소를 추출한 컴포넌트 목록. shadcn 기본 / 커스텀 / 레이아웃으로 구분.

---

## 1. shadcn 기본 (npx shadcn add로 설치)

`components/ui/`에 설치. 만들 필요 없음.

| 컴포넌트 | 용도 |
|----------|------|
| Button | primary(앰버)/outline/ghost |
| Card | 모든 카드 컨테이너 |
| Input / Textarea | 입력 필드 |
| Label | 폼 라벨 |
| Tabs | 필터, 대시보드 탭 |
| Badge | 말머리·유형·상태·역할 뱃지 |
| Progress | 기획 완성도 게이지 |
| Avatar | 프로필 이미지 |
| Pagination | 목록 페이지네이션 |
| Separator | 구분선 |
| Sonner (toast) | 등록/지원 완료 알림 |
| Form | react-hook-form 연동 |

---

## 2. 커스텀 컴포넌트 (직접 제작 — 서비스 고유)

### features/recruit/components/
| 컴포넌트 | 설명 |
|----------|------|
| `RecruitCard` | 모집 목록 카드 (유형·완성도·역할·지원수·기술 스택 태그) |
| `TechStackTags` | 기술 스택 뱃지 목록 (옅은 앰버 뱃지, 카드에선 3~4개+"+N", 0개면 접힘) |
| `CompletenessGauge` | 완성도 바 + % (Progress 감쌈) |
| `PlannerGuideCard` | 기획자 안내 카드 (앰버 박스) |
| `StructuredForm` | 구조화 기획 폼 (4개 질문) |
| `RoleInput` | 역할+인원 동적 추가 입력 |
| `TechStackInput` | 스택 태그 입력 (Enter로 추가·칩 삭제, 작성 폼용). 선택 입력 — PLAN 모집은 비워도 됨 |
| `ApplyBar` | 상세 하단 고정 지원 바 |

### features/community/components/
| 컴포넌트 | 설명 |
|----------|------|
| `PostListItem` | 커뮤니티 글 목록 행 (말머리+제목+메타) |
| `PromoteBanner` | 🌱 정식 모집으로 만들기 배너 |
| `CommentList` | 댓글 목록 + 입력 |

### features/auth/components/
| 컴포넌트 | 설명 |
|----------|------|
| `LoginForm` | 로그인 폼 |
| `SignupForm` | 회원가입 폼 |
| `SocialButtons` | 구글·카카오 로그인 버튼 |

### features/landing/components/
`Hero`, `Problem`, `Flow`, `Participation`, `Planner`, `Cta`, `Footer` (랜딩 섹션, 별도 톤)

---

## 3. 공용 (components/ 루트 또는 shared)

| 컴포넌트 | 위치 | 설명 |
|----------|------|------|
| `AppNav` | layout | 앱 상단 네비 (앱 내부 전 페이지 공통) |
| `AppShell` | layout | AppNav + content 래퍼 |
| `AuthLayout` | layout | 로그인/회원가입 중앙 정렬 |
| `PageHeader` | common | 제목+설명+우측 액션 |
| `TagFilter` | common | 말머리/유형 필터 탭 (Tabs 감쌈) |

> 랜딩은 AppNav 안 씀 — 자체 헤더+섹션.

---

## 4. 페이지별 조합

| 페이지 | 사용 컴포넌트 |
|--------|--------------|
| `/community` | AppShell · PageHeader · TagFilter · PostListItem × N · Pagination |
| `/community/[id]` | AppShell · PromoteBanner · CommentList |
| `/community/new` | AppShell · TagFilter · Input · Textarea · Button |
| `/recruit` | AppShell · PageHeader · TagFilter · RecruitCard × N |
| `/recruit/[id]` | AppShell · CompletenessGauge · Card(기획정보) · Badge(역할) · ApplyBar |
| `/recruit/new` ★ | AppShell · PlannerGuideCard · CompletenessGauge · StructuredForm · RoleInput · Button |
| `/dashboard` | AppShell · Avatar · Tabs · RecruitCard/PostListItem(재사용) |
| `/login`, `/signup` | AuthLayout · Input · Button · SocialButtons |
| `/` (랜딩) | 자체 (Hero, Problem, Flow, Participation, Planner, Cta, Footer) |

---

## 5. 핵심 재사용 컴포넌트 (중복 제거)

- `RecruitCard` → 모집 목록 + 대시보드
- `PostListItem` → 커뮤니티 목록 + 대시보드
- `TagFilter` → 커뮤니티 + 모집 양쪽
- `CompletenessGauge` → 모집 목록 카드 + 상세 + 작성

이 4개가 중복을 가장 많이 없앰.
