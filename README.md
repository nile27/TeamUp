# 📦 프로젝트 문서 안내 (READ FIRST)

이 폴더의 파일들을 새로 만들 Next.js 프로젝트에 어떻게 넣는지 안내합니다.

---

## 📁 파일 배치 방법

Next.js 프로젝트를 만든 뒤, 아래처럼 배치하세요. (대부분 Claude Code가 배치해줍니다)

```
teamup/                          # 새로 만들 Next.js 프로젝트 루트
├─ CLAUDE.md                     ← 이 폴더의 CLAUDE.md (루트에)
├─ docs/                         ← 이 폴더의 docs/ 통째로
│  ├─ PRD.md
│  ├─ ARCHITECTURE.md
│  ├─ SCHEMA.md
│  ├─ DESIGN.md
│  ├─ COMPONENTS.md
│  ├─ STATES.md
│  └─ reference/                 ← 시각 참고 자료 (브라우저로 열어보는 용)
│     ├─ feature_structure.html
│     ├─ component_breakdown.html
│     ├─ states_and_validation.html
│     ├─ app_pages_layout.html   (앱 내부 페이지 레이아웃 1)
│     ├─ app_pages_layout2.html  (앱 내부 페이지 레이아웃 2)
│     └─ erd.html
├─ prisma/
│  └─ schema.prisma              ← 이 폴더의 prisma/schema.prisma
├─ public/
│  └─ illustrations/             ← 랜딩 일러스트 (hero/problem/planner.svg)
└─ _design-mockups/
   └─ landing.html               ← 랜딩 구현 참고용 (완성 HTML)
```

---

## 📄 각 문서 역할

| 파일 | 역할 | 누가 읽나 |
|------|------|-----------|
| **CLAUDE.md** | 핵심 규칙·컨벤션 (항상 참조) | Claude Code |
| **docs/PRD.md** | 서비스·기능 명세 (뭘 만드나) | Claude Code |
| **docs/ARCHITECTURE.md** | 폴더 구조·렌더링·API (어떻게) | Claude Code |
| **docs/SCHEMA.md** | DB 모델 설명 | Claude Code |
| **docs/DESIGN.md** | 디자인 시스템 (색·타이포) | Claude Code |
| **docs/COMPONENTS.md** | 컴포넌트 목록·조합 | Claude Code |
| **docs/STATES.md** | 빈/로딩/에러 + 폼 검증 | Claude Code |
| **prisma/schema.prisma** | 실제 Prisma 스키마 | Prisma |
| **docs/reference/*.html** | 시각 참고 (레이아웃·구조 눈으로) | 사람(나) |
| **_design-mockups/landing.html** | 랜딩 완성 HTML → 컴포넌트로 이관 | Claude Code |
| **public/illustrations/*.svg** | 랜딩 일러스트 | 프로젝트 |

> `docs/reference/`의 HTML은 **브라우저로 열어서 눈으로 확인**하는 용도예요. Claude Code는 주로 `.md` 파일을 읽습니다.

---

## 🚀 시작 순서

### 1단계 — 내가 먼저 (외부 서비스)
1. [supabase.com](https://supabase.com) 가입 → 새 프로젝트 생성
2. 키 복사해두기 (2단계 이후 .env에 넣을 것):
   - Settings → Database → `DATABASE_URL`, `DIRECT_URL`
   - Settings → API → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2단계 — Claude Code에게 (아래 프롬프트)
프로젝트 생성 + 세팅을 맡깁니다. `PROMPT.md`의 첫 프롬프트 사용.

### 3단계 — 내가 (키 입력)
Claude Code가 만든 `.env.example`을 보고 `.env`에 실제 키 채우기.

### 4단계 — Claude Code에게 (개발)
마이그레이션 → 컴포넌트 → 페이지 순으로 개발.

---

자세한 첫 프롬프트는 `PROMPT.md` 참고.
