# Supabase Skill

## 목적

베이비로드 프로젝트에서 Supabase Auth, Database, Storage를 안전하고 일관되게 사용하기 위한 규칙이다.

## 기술 기준

- Supabase Auth / PostgreSQL / Storage
- Supabase JavaScript Client
- Row Level Security
- Next.js App Router
- Vercel Environment Variables

## 환경변수 기준

```env
NEXT_PUBLIC_APP_NAME=BabyRoad
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
```

**클라이언트 사용 가능**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**서버 전용**: `SUPABASE_SERVICE_ROLE_KEY`

`SUPABASE_SERVICE_ROLE_KEY`는 아래 위치에서 절대 사용 금지:

- `components/` 내 코드
- Client Component (`'use client'` 파일)
- `NEXT_PUBLIC_` 접두어 환경변수

## 파일 위치

```
lib/supabase/client.ts      — 브라우저 (Client Component)
lib/supabase/server.ts      — 서버 (Server Component, Route Handler)
lib/supabase/middleware.ts  — 미들웨어
lib/supabase/admin.ts       — service role 전용 (서버에서만 import)
```

## Auth 사용 규칙

- 로그인 사용자 식별: `auth.users.id` 기준
- 사용자 정보: `profiles` 테이블에 저장
- Google 로그인은 Google Identity Services ID Token을 `supabase.auth.signInWithIdToken`으로 전달해 세션을 생성한다
- Google ID Token 로그인에서 Supabase에는 원문 nonce를 전달하고, Google에는 SHA-256 hex hash nonce를 전달한다
- `profiles` 없으면 → 온보딩으로 이동
- `profiles` 있으면 → 대시보드로 이동
- 로그아웃 시 세션 제거 후 로그인 페이지로 이동

## Database 사용 규칙

- 사용자 소유 테이블에 `user_id` 필수
- 아이 관련 테이블에 `child_id` 필수
- 주요 테이블에 `created_at`, `updated_at`, `deleted_at` 필수
- 삭제 가능한 데이터는 soft delete 사용
- 사용자는 본인 데이터만 조회, 등록, 수정, 삭제 가능
- RLS를 전제로 쿼리 작성

## Storage 사용 규칙

권장 버킷:

```
child-profiles    — 아이 프로필 이미지
child-albums      — 성장 앨범 이미지
medical-files     — 예방접종 증명, 건강검진 결과
community-images  — 커뮤니티 첨부 이미지
```

업로드 시 검증 항목: 로그인 여부 / 파일 크기 / MIME 타입 / 확장자 / 사용자 권한

허용 MIME 타입: `image/jpeg`, `image/png`, `image/webp`

파일 경로:

```
{user_id}/{child_id}/{timestamp}-{filename}
{user_id}/posts/{post_id}/{timestamp}-{filename}   ← 커뮤니티
```

## CRUD 패턴

### 조회 — 삭제되지 않은 본인 데이터만

```typescript
.eq('user_id', user.id)
.is('deleted_at', null)
```

### 등록 — user_id 반드시 포함

```typescript
const payload = {
  user_id: user.id,
  child_id: childId,
  created_at: new Date().toISOString(),
}
```

### 수정 — 소유자 조건 함께 적용

```typescript
.eq('id', id)
.eq('user_id', user.id)
```

### 삭제 — soft delete

```typescript
.update({ deleted_at: new Date().toISOString() })
.eq('id', id)
.eq('user_id', user.id)
```

## 오류 처리 규칙

Supabase 오류 메시지를 사용자에게 그대로 노출하지 않는다.

```
// 금지
duplicate key value violates unique constraint...

// 권장
저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.
```

## 환경변수 값 검수 규칙

- `.env.local` 파일은 읽지 않는다.
- 필요한 환경변수 이름은 `.env.local.example` 기준으로 확인한다.
- Vercel 환경변수 Value에는 실제 값만 들어가야 한다.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=`처럼 키 이름을 Value에 포함하지 않는다.
- 줄바꿈, 중복 값, 다른 키 이름이 Value에 섞이면 Supabase 클라이언트 인증이 실패할 수 있다.

## 완료 기준

- Supabase URL과 anon key가 정상 사용되는가
- `SUPABASE_SERVICE_ROLE_KEY`가 클라이언트에 노출되지 않는가
- 로그인 사용자 기준으로 데이터가 제한되는가
- RLS 정책과 충돌하지 않는가
- 파일 업로드 권한이 안전한가
- 오류 메시지가 사용자 친화적인가

## 금지사항

- `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출
- RLS 없이 개인정보 테이블 사용
- 다른 사용자의 데이터 조회 가능 구조
- Storage 공개 버킷 남용
- 개인정보 `console.log` 출력
- `auth.users`를 클라이언트에서 직접 조작
