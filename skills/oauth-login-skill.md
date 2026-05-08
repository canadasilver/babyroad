# OAuth Login Skill

## 목적

베이비로드 프로젝트에서 Supabase Auth 기반 소셜 로그인을 일관되게 구현하기 위한 규칙이다.

## 기술 기준

- Supabase Auth
- Google Identity Services + Supabase `signInWithIdToken`
- Kakao / Naver redirect OAuth 확장 구조
- Next.js App Router
- Vercel Environment Variables

## 로그인 제공자 우선순위

```
1. Google
2. Kakao
3. Naver
```

Kakao와 Naver는 한국 서비스 확장을 고려해 반드시 확장 가능하게 설계한다.

## 기본 흐름

### Google 로그인 (현재 기본 방식)

1. 사용자가 로그인 페이지 접속
2. Google Identity Services 버튼 클릭
3. Google ID Token 발급
4. `supabase.auth.signInWithIdToken({ provider: 'google', token, nonce })` 호출
5. Supabase Auth 세션 생성
6. `profiles` 테이블에 사용자 정보 존재 여부 확인
7. `profiles` 없음 → `/onboarding` 이동
8. `profiles` 있음 → `/dashboard` 이동

### Kakao / Naver 등 redirect OAuth 확장

1. 사용자가 로그인 페이지 접속
2. OAuth 제공자 버튼 클릭
3. Supabase Auth OAuth 인증 시작
4. 인증 성공 후 `/auth/callback`으로 복귀
5. 서버에서 세션 확인
6. `profiles` 확인 후 온보딩 또는 대시보드로 이동

## 필수 파일

```
app/login/page.tsx
app/auth/callback/route.ts
app/onboarding/page.tsx
app/dashboard/page.tsx
components/auth/SocialLoginButtons.tsx
components/auth/LogoutButton.tsx
```

## 환경변수

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

## Supabase Redirect URL

Google ID Token 로그인은 앱의 `/auth/callback` redirect를 기본으로 사용하지 않는다.
Kakao / Naver 등 redirect OAuth 제공자를 사용하는 경우 Supabase Dashboard → Authentication → URL Configuration에 등록:

```
http://localhost:3000/auth/callback               ← 로컬
https://프로젝트도메인.vercel.app/auth/callback    ← Vercel 배포
https://도메인/auth/callback                       ← 커스텀 도메인
```

## OAuth 호출 기준

Google은 redirect OAuth 대신 ID Token 로그인을 기본으로 사용한다:

```typescript
const { error } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: googleCredential,
  nonce,
})
```

Google Identity Services 초기화 시 nonce 기준:

```typescript
const hashedNonce = sha256Hex(nonce)

window.google.accounts.id.initialize({
  client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  callback: handleGoogleCredential,
  nonce: hashedNonce,
})
```

- Supabase에는 원문 nonce를 전달한다.
- Google에는 SHA-256 hex hash nonce를 전달한다.
- base64url hash를 사용하면 Supabase ID Token 검증에 실패할 수 있다.

## redirect OAuth 콜백 처리 기준

Kakao / Naver 등 redirect OAuth 제공자에 적용한다.

1. code 파라미터 확인
2. 서버에서 Supabase 세션 교환
3. 세션 사용자 확인
4. profiles 조회
5. 온보딩 또는 대시보드로 redirect

## profiles 생성 기준

온보딩에서 생성하는 것을 기본으로 한다. 자동 생성이 필요한 경우에도 최소 정보만 저장한다.

필수 저장 항목:

```
user_id, email, nickname, avatar_url, provider
role (기본값: 'user')
```

## 로그인 버튼 규칙

- 버튼 텍스트: `Google로 계속하기` / `Kakao로 계속하기` / `Naver로 계속하기`
- Google 버튼은 Google Identity Services 클릭 동작을 유지해야 한다. Google 버튼 iframe을 완전히 숨기면 클릭이 동작하지 않을 수 있다.
- 로딩 상태 표시
- 중복 클릭 방지
- 실패 시 사용자 친화적 메시지 표시

## 보호 페이지 기준

서버에서 세션 확인 후 세션 없으면 `/login`으로 redirect.

대상 경로: `dashboard`, `onboarding`, `children`, `growth`, `vaccination`, `feeding`, `sleep`, `health`, `mypage`, `community/write`

## 로그아웃 기준

```
1. Supabase signOut 호출
2. 세션 삭제
3. /login 으로 이동
```

## 오류 처리 기준

OAuth 오류 메시지를 원문 그대로 노출하지 않는다.

```
// 금지
invalid_grant, provider error, redirect_uri_mismatch

// 권장
로그인 중 문제가 발생했습니다. 다시 시도해 주세요.
```

## 보안 기준

- `client_secret`은 브라우저에 노출하지 않는다
- `SUPABASE_SERVICE_ROLE_KEY`를 로그인에 사용하지 않는다
- Google ID Token, nonce, auth code, access token은 로그에 출력하지 않는다
- Redirect URL을 명확히 제한한다
- 로그인 없이 사용자 데이터를 조회하지 않는다
- 개인정보를 query string에 담지 않는다
- 사용자 정보를 `console.log`로 출력하지 않는다

## 완료 기준

- Google 로그인 구조가 동작하는가
- Kakao와 Naver 확장 구조가 있는가
- Google `signInWithIdToken` 세션 생성이 정상인가
- redirect OAuth 제공자를 사용하는 경우 콜백 라우트가 정상 처리되는가
- `profiles` 없을 때 온보딩으로 이동하는가
- `profiles` 있을 때 dashboard로 이동하는가
- 로그아웃이 동작하는가
- Vercel 배포 URL에서도 Google JavaScript origin과 Supabase 세션 생성이 정상 동작하는가

## 금지사항

- `client_secret` 클라이언트 노출
- `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출
- Redirect URL 하드코딩 남용
- 로그인 오류 원문 노출
- 개인정보 `console.log` 출력
- 로그인 없이 보호 페이지 렌더링
