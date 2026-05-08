# 베이비로드 BabyRoad

베이비로드는 임신부터 아이가 학교에 가기 전까지의 성장 여정을 기록하고 관리하는 육아 플랫폼입니다.

초기 MVP는 Supabase와 Vercel의 무료 인프라를 우선 사용하며, Claude Code와 Codex가 같은 기준으로 협업할 수 있도록 `CLAUDE.md`, `agents/`, `skills/` 문서를 개발 기준으로 사용합니다.

## 기술 스택

| 영역 | 기술 |
| --- | --- |
| Frontend | Next.js App Router, React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Hosting | Vercel |

## 개발 기준 문서

작업 전에는 반드시 아래 순서로 기준을 확인합니다.

1. `CLAUDE.md`
2. 관련 `agents/*.md`
3. 관련 `skills/*.md`
4. 현재 프로젝트 코드

주요 문서:

- `agents/product-planner-agent.md`
- `agents/frontend-agent.md`
- `agents/database-agent.md`
- `agents/supabase-agent.md`
- `agents/auth-agent.md`
- `agents/deploy-agent.md`
- `agents/qa-review-agent.md`
- `skills/nextjs-skill.md`
- `skills/supabase-skill.md`
- `skills/database-schema-skill.md`
- `skills/rls-policy-skill.md`
- `skills/oauth-login-skill.md`
- `skills/vercel-deploy-skill.md`

## 프로젝트 구조

```text
babyroad/
├─ app/                    # Next.js App Router 페이지
├─ components/             # 재사용 UI 컴포넌트
├─ lib/                    # 유틸리티, Supabase 클라이언트
├─ types/                  # TypeScript 타입
├─ supabase/               # 마이그레이션, RLS, seed SQL
├─ agents/                 # 역할별 작업 기준
├─ skills/                 # 기술별 구현 기준
├─ middleware.ts           # Supabase 세션 갱신 및 경로 보호
├─ CLAUDE.md               # 최상위 개발 기준
├─ README.md               # 프로젝트 안내
└─ .env.local.example      # 환경변수 이름 예시
```

## 환경변수

실제 값은 `.env.local`과 Vercel Environment Variables에 직접 입력합니다.
`.env.local`은 Git에 올리지 않습니다.

`.env.local.example`에는 키 이름만 유지합니다.

```env
NEXT_PUBLIC_APP_NAME=
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

환경변수 보안 기준:

- `.env.local` 파일은 실제 비밀 키가 들어있는 로컬 전용 파일이므로 내용을 읽거나 출력하지 않습니다.
- 필요한 환경변수 이름은 `.env.local.example` 기준으로 확인합니다.
- `NEXT_PUBLIC_*` 값만 브라우저 코드에서 사용합니다.
- `SUPABASE_SERVICE_ROLE_KEY`, OAuth Client Secret, DB Password는 클라이언트 코드에서 절대 사용하지 않습니다.
- Vercel 환경변수 Value에는 값만 입력합니다. `NEXT_PUBLIC_SUPABASE_ANON_KEY=`처럼 키 이름을 함께 넣지 않습니다.
- Value에 줄바꿈, 중복 값, 다른 키 이름이 섞이면 Supabase 인증이 실패할 수 있습니다.

## 인증 방식

현재 Google 로그인은 redirect OAuth 흐름이 아니라 Google Identity Services ID Token 방식입니다.

1. 클라이언트에서 Google Identity Services 버튼을 렌더링합니다.
2. Google이 ID Token을 발급합니다.
3. `supabase.auth.signInWithIdToken({ provider: 'google', token, nonce })`로 Supabase 세션을 생성합니다.
4. `profiles` 테이블에 프로필이 없으면 `/onboarding`으로 이동합니다.
5. `profiles` 테이블에 프로필이 있으면 `/dashboard`로 이동합니다.

Google ID Token nonce 기준:

- 원문 nonce는 Supabase `signInWithIdToken` 호출에 전달합니다.
- Google Identity Services 초기화에는 원문 nonce의 SHA-256 hex hash를 전달합니다.
- base64url nonce hash를 사용하면 Supabase 검증에 실패할 수 있습니다.
- ID Token, nonce, auth code, access token은 로그에 출력하지 않습니다.

Kakao와 Naver는 MVP 이후 redirect OAuth 확장 구조로 연결할 수 있습니다. redirect OAuth 제공자를 사용하는 경우에만 `/auth/callback` 기반 서버 콜백을 사용합니다.

## Google Cloud 설정

Google Cloud Console → OAuth Client → Authorized JavaScript origins:

```text
http://localhost:3000
https://babyroad.vercel.app
```

커스텀 도메인을 사용하면 해당 origin도 추가합니다.

Google ID Token 로그인만 사용하는 경우 앱의 `/auth/callback` redirect URL은 필수 흐름이 아닙니다.
redirect OAuth를 함께 사용하는 경우 Google Cloud Authorized redirect URIs에는 Supabase Callback URL을 등록합니다.

```text
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

## Supabase 기준

- 브라우저 클라이언트는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 사용합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트 코드에 절대 노출하지 않습니다.
- 사용자 데이터 테이블은 RLS를 활성화합니다.
- 사용자는 본인 데이터만 조회, 등록, 수정, 삭제할 수 있어야 합니다.
- 사용자 소유 데이터에는 `user_id`를 포함합니다.
- 아이 관련 데이터에는 `child_id`를 포함합니다.
- 삭제 가능한 데이터는 `deleted_at` 기반 soft delete를 고려합니다.

## 주요 MVP 테이블

```text
profiles
children
child_growth_records
child_feeding_records
child_sleep_records
child_health_records
vaccines
vaccine_schedules
child_vaccination_records
development_contents
development_checklists
community_posts
community_comments
community_likes
community_reports
notifications
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:3000
```

## 빌드 확인

```bash
npm run build
```

현재 기준으로 배포 전에는 `npm run build`가 성공해야 합니다.

## Vercel 배포 확인

배포 전 확인 항목:

- Vercel Environment Variables에 필요한 환경변수 이름이 모두 등록되어 있는가
- 환경변수 Value에 키 이름, 줄바꿈, 중복 값이 섞이지 않았는가
- Google Authorized JavaScript origins에 운영 도메인이 등록되어 있는가
- Supabase RLS 정책이 적용되어 있는가
- `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트 코드에 노출되지 않았는가
- `npm run build`가 성공하는가

## 의료 정보 주의

성장, 발달, 예방접종, 건강 관련 정보는 일반적인 참고 정보입니다.
아이의 건강 상태, 질병, 발달 지연, 접종 가능 여부는 반드시 전문 의료진과 상담해야 합니다.

의료 진단처럼 보이는 문구를 작성하지 않고, 공식 검증 없는 성장 기준을 확정값처럼 표시하지 않습니다.

## 보안 원칙

- `.env.local`은 Git에 포함하지 않습니다.
- 실제 키값을 문서, 코드, 로그에 출력하지 않습니다.
- 개인정보를 `console.log`로 출력하지 않습니다.
- RLS 없는 사용자 개인정보 테이블을 운영하지 않습니다.
- 이미지 업로드 기능은 파일 크기, MIME 타입, 권한을 검증해야 합니다.
- OAuth Client Secret과 service role key는 서버 전용으로만 다룹니다.
