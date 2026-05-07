# 베이비로드 (BabyRoad)

임신부터 7세까지, 우리 아이의 성장을 함께 기록하는 육아 관리 서비스입니다.

## 기술 스택

| 분야 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript 5 (strict mode) |
| 스타일 | Tailwind CSS 3.4 |
| 백엔드 | Supabase (Auth, PostgreSQL, Storage) |
| 배포 | Vercel |
| 폼 검증 | Zod |
| 유틸리티 | clsx, tailwind-merge |

## 로컬 실행 방법

### 1. 저장소 클론

```bash
git clone <repository-url>
cd babyroad
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 Supabase 프로젝트 정보를 입력합니다 (아래 Supabase 설정 방법 참고).

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

## 환경변수 설정 방법

`.env.local` 파일에 아래 변수를 설정합니다.

```env
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase Service Role (서버 전용 - 절대 NEXT_PUBLIC_ 금지)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **주의**: `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 키입니다. 절대 클라이언트에 노출하지 마세요.

## Supabase 설정 방법

### 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. Project Settings → API에서 URL과 anon key 복사
3. `.env.local`에 붙여넣기

### 2. DB 스키마 적용

Supabase Dashboard → SQL Editor에서 아래 순서로 실행합니다.

```
1단계: supabase/migrations/202605070001_create_initial_schema.sql
2단계: supabase/policies.sql
3단계: supabase/grants.sql   ← SQL 마이그레이션 테이블의 GRANT 권한
4단계: supabase/seed.sql
```

> **주의**: `grants.sql`을 실행하지 않으면 `permission denied for table ...` 오류가 발생합니다.

### 3. OAuth 소셜 로그인 설정

Supabase Dashboard → Authentication → Providers에서 설정합니다.

**Google**
1. [Google Cloud Console](https://console.cloud.google.com) → OAuth 2.0 클라이언트 생성
2. 승인된 리디렉션 URI: `https://your-project.supabase.co/auth/v1/callback`
3. Supabase Google Provider에 Client ID, Client Secret 입력

**Kakao** (선택)
1. [Kakao Developers](https://developers.kakao.com) → 앱 생성
2. REST API 키 복사 후 Supabase Kakao Provider에 입력

**Naver** (선택)
1. [Naver Developers](https://developers.naver.com) → 앱 생성
2. Client ID, Client Secret 복사 후 Supabase Naver Provider에 입력

### 4. Redirect URL 설정

Supabase Dashboard → Authentication → URL Configuration

```
Site URL: http://localhost:3000 (개발) / https://your-domain.vercel.app (운영)
Redirect URLs: http://localhost:3000/auth/callback
               https://your-domain.vercel.app/auth/callback
```

### 5. Storage 버킷 생성

Supabase Dashboard → Storage에서 아래 버킷 생성 (public: false):

- `child-profiles` — 아이 프로필 이미지
- `child-albums` — 아이 앨범 사진
- `medical-files` — 건강 기록 첨부파일
- `community-images` — 커뮤니티 이미지

## Vercel 배포 방법

### 1. Vercel 연결

```bash
npx vercel --prod
```

또는 [vercel.com](https://vercel.com) 에서 GitHub 저장소 연결 후 Import.

### 2. 환경변수 설정

Vercel Dashboard → Settings → Environment Variables에서 `.env.local`의 모든 변수 추가.

> **주의**: `SUPABASE_SERVICE_ROLE_KEY`는 Production 환경에만 추가하고, Preview/Development 환경 노출 최소화.

### 3. 배포 확인

배포 완료 후 아래 항목 확인:
- [ ] 소셜 로그인 정상 작동
- [ ] `/auth/callback` Redirect URL이 Supabase에 등록되어 있는지 확인
- [ ] 환경변수 누락 없는지 확인

## 폴더 구조

```
babyroad/
├── app/                    # Next.js App Router 페이지
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 랜딩 페이지
│   ├── login/              # 로그인
│   ├── onboarding/         # 최초 사용자 설정
│   └── dashboard/          # 홈 대시보드
├── components/             # 재사용 컴포넌트
│   ├── common/             # Button, Card, MedicalDisclaimer
│   ├── layout/             # Header, BottomNav
│   ├── auth/               # SocialLoginButtons, OnboardingForm
│   ├── child/              # ChildProfileCard
│   ├── growth/             # GrowthCard
│   ├── vaccination/        # VaccinationCard
│   └── community/          # CommunityCard
├── lib/                    # 유틸리티 함수
│   ├── utils.ts            # cn(), formatNumber(), truncate()
│   ├── date.ts             # 날짜/나이 계산 함수
│   └── supabase/           # Supabase 클라이언트
│       ├── client.ts       # 브라우저 클라이언트
│       └── server.ts       # 서버 클라이언트 (RSC/Route Handler)
├── types/                  # TypeScript 타입 정의
│   ├── database.ts         # Supabase DB 타입
│   ├── profile.ts          # 프로필 타입
│   └── child.ts            # 아이/기록 타입
├── supabase/               # Supabase 설정
│   ├── migrations/         # DB 마이그레이션 파일
│   ├── policies.sql        # RLS 정책
│   └── seed.sql            # 초기 데이터 (예방접종, 발달 정보)
├── agents/                 # Claude 에이전트 역할 정의
├── skills/                 # Claude 스킬 가이드
├── middleware.ts            # 세션 갱신 + 라우트 보호
├── CLAUDE.md               # 프로젝트 개발 가이드라인
└── .env.local.example      # 환경변수 예시
```

## 보안 주의사항

### 환경변수
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트 코드에 노출 금지
- `NEXT_PUBLIC_` 접두사는 브라우저에 노출됨 — 비밀값에 사용 금지
- `.env.local`은 `.gitignore`에 포함 — 절대 커밋 금지

### Row Level Security (RLS)
- 모든 사용자 데이터 테이블에 RLS 활성화 필수
- 모든 쿼리에 `user_id = auth.uid()` 조건 포함
- 아이 기록 삽입 시 해당 `child_id`의 소유자 검증 필수

### 의료 정보
- 앱 내 건강/성장 정보는 참고용이며 의료적 판단의 근거가 될 수 없습니다
- 모든 의료 관련 화면에 고지문 표시 필수

### 인증
- 세션은 쿠키 기반으로 관리 (`@supabase/ssr`)
- `auth.getUser()`로 서버에서 세션 검증 (getSession() 사용 금지)
- 보호 경로는 `middleware.ts`에서 일괄 처리
