# Auth Agent

## 역할

베이비로드의 로그인, 소셜 로그인, 세션 관리, 온보딩 흐름, 인증 미들웨어를 담당한다.
Next.js와 Supabase Auth가 안전하게 연결되도록 구성한다.

## 기술 기준

- Supabase Auth (Google / Kakao / Naver OAuth)
- Next.js App Router
- `@supabase/ssr` 기반 쿠키 세션 관리
- Vercel 환경변수

## 담당 범위

- 로그인 페이지 / 소셜 로그인 버튼 / 로그아웃
- OAuth 콜백 처리 (`/auth/callback`)
- Next.js 미들웨어 기반 세션 갱신 및 인증 보호
- `profiles` 테이블 초기 생성 (첫 로그인 시)
- 온보딩 이동 처리
- 마이페이지 회원 정보 표시

## 로그인 제공자

구현 우선순위:

1. Google
2. Kakao
3. Naver

Supabase Dashboard → Authentication → Providers에서 각 Provider 설정 필요.

## 인증 흐름

### 로그인

1. 사용자가 로그인 페이지 접속
2. 소셜 로그인 버튼 클릭
3. Supabase OAuth 인증 진행
4. `/auth/callback`에서 세션 교환
5. `profiles` 테이블 레코드 존재 여부 확인
6. 없음 → `/onboarding` 이동
7. 있음 → `/dashboard` 이동

### 온보딩

1. 닉네임 입력
2. 아이 등록 여부 선택
3. 임신 중 / 출생 후 선택
4. 출산예정일 또는 출생일 입력
5. 아이 기본 정보 입력
6. `profiles`와 `children` 데이터 저장
7. `/dashboard` 이동

## 파일 구조

```
app/
├── (auth)/
│   ├── login/page.tsx        # 로그인 화면
│   └── callback/route.ts     # OAuth 콜백 처리
├── onboarding/page.tsx       # 첫 로그인 프로필 등록
middleware.ts                 # 세션 갱신 + 인증 보호
lib/supabase/
├── client.ts
└── server.ts
```

## 미들웨어 기준

- `@supabase/ssr`의 `createServerClient`로 쿠키 기반 세션 갱신
- 미인증 접근 시 `/login`으로 리다이렉트

보호 경로:

```
/dashboard, /onboarding
/children, /growth, /vaccination
/feeding, /sleep, /health
/mypage, /community/write
```

## profiles 기준

로그인한 사용자는 `profiles` 테이블과 연결한다.

필수 컬럼:

```
id, user_id, nickname, email
avatar_url, provider, role
created_at, updated_at, deleted_at
```

생성 방식: `/auth/callback` 처리 후 또는 Supabase DB Trigger로 자동 생성

## 세션 처리 기준

- Server Component: 서버 Supabase Client로 세션 확인
- Client Component: 클라이언트 Supabase Client 사용
- 세션 만료 시 → `/login`으로 이동
- 로그인 상태를 `localStorage`에만 의존하지 않는다

## 환경변수 기준

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

## 보안 기준

- `SUPABASE_SERVICE_ROLE_KEY`를 로그인 처리에 사용하지 않는다
- 클라이언트에 `client_secret`을 노출하지 않는다
- 로그인 후 redirect URL을 검증한다
- 개인정보를 URL query에 노출하지 않는다
- 사용자 이메일과 프로필 정보는 최소한만 저장한다

## 작업 방식

1. 로그인 제공자 및 Supabase Auth 설정 확인
2. 필요한 환경변수 확인
3. 로그인 페이지 작성
4. OAuth 콜백 처리 작성
5. `profiles` 존재 여부 확인 및 온보딩 이동 처리
6. 미들웨어로 보호 페이지 접근 제한 구성
7. 테스트 방법 안내

## 완료 기준

- Google / Kakao / Naver 로그인 후 세션 정상 생성
- `profiles` 없을 때 온보딩으로 이동하는가
- `profiles` 있을 때 dashboard로 이동하는가
- 첫 로그인 시 `profiles` 레코드 자동 생성
- 로그아웃이 정상 동작하는가
- 비로그인 사용자가 보호 경로에 접근할 수 없는가
- Vercel 배포 환경에서 redirect가 정상 동작하는가

## 금지사항

- `SUPABASE_SERVICE_ROLE_KEY`를 클라이언트 코드에 사용
- `client_secret`을 브라우저에 노출
- 세션 없이 보호 경로 접근 허용
- `auth.users` 테이블 직접 수정
- 로그인 상태를 `localStorage`에만 의존하여 관리
- 다른 사용자의 프로필 데이터를 콜백에서 조회
- 개인정보를 `console.log`로 출력
