# Vercel Deploy Skill

## 목적

베이비로드 프로젝트를 Vercel에 안전하게 배포하고 운영하기 위한 규칙이다.

## 기술 기준

- Vercel / Next.js / Supabase
- GitHub 연동 배포
- 무료 플랜 기준 MVP 배포

## 배포 기본 흐름

```
1. GitHub 저장소 준비
2. Vercel 프로젝트 생성 및 GitHub 연결
3. 환경변수 등록
4. 빌드 설정 확인 후 배포 실행
5. Google Authorized JavaScript origins 등록
6. redirect OAuth 제공자를 사용하는 경우 Supabase Redirect URL 등록
7. 운영 URL 테스트
```

## Vercel 환경변수

Vercel Project Settings → Environment Variables에 등록:

```env
NEXT_PUBLIC_APP_NAME=BabyRoad
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=      ← 서버 전용, NEXT_PUBLIC_ 절대 금지

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

로컬 개발은 `.env.local` 사용 (Git 업로드 금지, `.env.local.example`에 키 이름만 작성)
Vercel Environment Variables의 Value에는 실제 값만 입력한다. `KEY=value` 형식, 줄바꿈, 중복 값은 넣지 않는다.

## NEXT_PUBLIC_APP_URL 기준

```
로컬:          http://localhost:3000
Vercel 배포:   https://프로젝트명.vercel.app
커스텀 도메인: https://도메인
```

## Google 로그인 도메인 설정

Google 기본 로그인은 Google Identity Services + Supabase `signInWithIdToken` 방식을 사용한다.

Google Cloud Console → OAuth Client → Authorized JavaScript origins:

```
http://localhost:3000
https://프로젝트명.vercel.app
https://도메인
```

Google Cloud Console → OAuth Client → Authorized redirect URIs:

```
https://<supabase-project-ref>.supabase.co/auth/v1/callback
```

redirect OAuth를 함께 사용하는 경우에 등록한다.

## Supabase Redirect URL

Kakao / Naver 등 redirect OAuth 제공자를 사용하는 경우 Supabase Dashboard → Authentication → URL Configuration에 등록:

```
http://localhost:3000/auth/callback               ← 로컬
https://프로젝트명.vercel.app/auth/callback        ← Vercel 배포
https://도메인/auth/callback                       ← 커스텀 도메인
```

## 배포 전 체크리스트

```
[ ] npm run build 성공 (TypeScript 오류 없음)
[ ] 환경변수 누락 없음
[ ] 환경변수 Value에 키 이름, 줄바꿈, 중복 값이 섞이지 않음
[ ] SUPABASE_SERVICE_ROLE_KEY 클라이언트 노출 없음
[ ] Supabase 연결 정상
[ ] RLS 정책 적용 완료
[ ] Google Authorized JavaScript origins 등록 완료
[ ] redirect OAuth 사용 시 OAuth Redirect URL 등록 완료
[ ] 로그인 페이지 정상
[ ] 보호 페이지 redirect 정상
[ ] 모바일 UI 확인
```

## 빌드 오류 확인 순서

```
1. TypeScript 타입 오류
2. import 경로 오류
3. 환경변수 누락
4. Server Component / Client Component 구분 오류
5. window / document 서버 사용 오류
6. Supabase Client 사용 위치 오류
7. 패키지 설치 누락
8. Next.js 설정 오류
```

## 자주 발생하는 오류

**`window is not defined`**
Server Component에서 `window`를 사용한 경우. → Client Component로 분리하거나 `useEffect` 안에서 사용한다.

**`Missing environment variable`**
환경변수 누락. → `.env.local`과 Vercel Environment Variables를 확인한다.

**Hydration error**
서버/클라이언트 렌더링 값 불일치. → 날짜, 랜덤값, 브라우저 전용 값은 클라이언트에서 처리한다.

**Supabase auth redirect error**
OAuth Redirect URL 불일치. → Supabase Auth Redirect URL과 Vercel 운영 URL을 확인한다.

**Google ID Token login provider error**
Google ID Token 검증 실패. → `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, Authorized JavaScript origins, nonce SHA-256 hex 처리, Supabase anon key 값을 확인한다.

## 운영 테스트 항목

```
[ ] 랜딩 / 로그인 페이지 접속
[ ] Google ID Token 로그인 작동
[ ] redirect OAuth 사용 시 /auth/callback 작동
[ ] 온보딩 → 대시보드 이동
[ ] 아이 등록 / 성장 기록 저장
[ ] Supabase 데이터 저장 확인
[ ] 보호 페이지 접근 제한 확인
[ ] 모바일 화면 정상
[ ] 브라우저 콘솔 오류 없음
```

## 무료 플랜 주의사항

다음 항목이 증가하면 유료 전환을 검토한다:

- Vercel 트래픽 / 빌드 시간
- Supabase DB 용량 / Storage 사용량
- Supabase Auth 사용량 / Edge Functions 사용량
- 커뮤니티 트래픽 / 이미지 업로드 증가

## 완료 기준

- `npm run build`가 성공하는가
- Vercel 배포가 성공하는가
- 운영 URL 접속 및 Supabase 연결이 정상인가
- Google ID Token 로그인 및 Authorized JavaScript origins가 정상인가
- redirect OAuth 사용 시 Redirect URL이 정상인가
- 모바일 화면이 정상인가
- 환경변수가 안전하게 관리되는가

## 금지사항

- `.env.local` Git 업로드
- `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출
- 빌드 오류 임시 무시
- TypeScript 오류를 `any`로 무조건 덮기
- Google Authorized JavaScript origins 확인 없이 배포 완료 처리
- redirect OAuth 사용 시 OAuth Redirect URL 확인 없이 배포 완료 처리
- RLS 없이 운영 배포
