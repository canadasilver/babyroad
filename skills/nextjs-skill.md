# Next.js Skill

## 목적

베이비로드 프로젝트에서 Next.js App Router 기반 화면과 기능을 일관된 구조로 개발하기 위한 규칙이다.

## 기술 기준

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Server Component 우선
- Client Component 최소화
- Vercel 배포 가능 구조

## 기본 폴더 구조

```
app/
components/
lib/
types/
public/
```

## app 폴더 규칙

페이지는 `app/` 폴더에 작성한다.

```
app/page.tsx
app/login/page.tsx
app/onboarding/page.tsx
app/dashboard/page.tsx
app/children/page.tsx
app/children/new/page.tsx
app/growth/page.tsx
app/vaccination/page.tsx
app/feeding/page.tsx
app/sleep/page.tsx
app/health/page.tsx
app/development/page.tsx
app/community/page.tsx
app/community/write/page.tsx
app/mypage/page.tsx
```

## components 폴더 규칙

재사용 가능한 컴포넌트는 `components/` 폴더에 작성한다.

```
components/common/
components/layout/
components/auth/
components/child/
components/growth/
components/vaccination/
components/feeding/
components/sleep/
components/health/
components/development/
components/community/
```

## Server Component 기준

기본적으로 페이지와 데이터 조회는 Server Component로 작성한다.

Server Component에서 처리:

- 로그인 세션 확인
- Supabase 서버 조회
- 초기 데이터 조회
- 보호 페이지 redirect
- SEO metadata

## Client Component 기준

사용자 상호작용이 필요한 경우에만 Client Component를 사용한다.

Client Component가 필요한 경우:

- form 입력
- 버튼 클릭 이벤트
- modal / toast / tabs
- chart
- 파일 업로드
- 클라이언트 상태 관리

Client Component 파일 상단에 반드시 작성:

```typescript
'use client'
```

## TypeScript 규칙

- `any` 사용 최소화
- props 타입 명확히 정의
- API 응답 타입 명확히 정의
- Supabase 테이블 타입은 `types/`에 정의
- 날짜와 숫자 타입 명확히 구분

```typescript
type ChildCardProps = {
  id: string
  name: string
  gender: 'male' | 'female' | 'unknown'
  birthDate?: string | null
  dueDate?: string | null
}
```

## Tailwind CSS 규칙

- 모바일 우선으로 작성
- 카드형 UI를 기본으로 사용
- 입력폼에 라벨과 도움말 포함
- 버튼 스타일 일관되게 유지
- 과도한 애니메이션 금지
- 부모가 한 손으로 빠르게 기록할 수 있는 UX 우선

## 기본 UI 패턴

### 페이지 구조

```tsx
export default function Page() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6">
      <section className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900">페이지 제목</h1>
        <p className="mt-2 text-sm text-slate-600">페이지 설명</p>
      </section>
    </main>
  )
}
```

### 카드 구조

```tsx
<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
  <h2 className="text-base font-semibold text-slate-900">카드 제목</h2>
  <p className="mt-1 text-sm text-slate-600">카드 내용</p>
</div>
```

### 입력폼 구조

```tsx
<label className="block">
  <span className="text-sm font-medium text-slate-700">라벨</span>
  <input
    type="text"
    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
  />
</label>
```

### 빈 데이터 상태

```tsx
<div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
  <p className="text-sm text-slate-600">아직 등록된 기록이 없습니다.</p>
</div>
```

## 데이터 상태 처리

모든 데이터 화면은 다음 4가지 상태를 처리한다:

- `loading`
- `error`
- `empty`
- `success`

## 인증 페이지 처리

- 로그인이 필요한 페이지는 서버에서 세션 확인
- 세션 없음 → `/login`으로 이동
- 온보딩 필요 시 → `/onboarding`으로 이동

## 의료 안내 문구

성장, 발달, 예방접종, 건강 화면에 반드시 표시:

```
본 앱에서 제공하는 성장, 발달, 예방접종, 건강 정보는 일반적인 참고 정보입니다.
아이의 건강 상태, 질병, 발달 지연, 접종 가능 여부는 반드시 전문 의료진과 상담해 주세요.
```

## 완료 기준

- Next.js App Router 구조에 맞는가
- TypeScript 오류가 없는가
- 모바일 화면에서 사용 가능한가
- `loading` / `error` / `empty` 상태가 있는가
- Supabase 연동 위치가 적절한가 (Server/Client 구분)
- Vercel 빌드가 가능한가
- 개인정보가 클라이언트 로그에 노출되지 않는가

## 금지사항

- Pages Router 방식 사용
- 불필요한 Client Component 남용
- `any` 타입 남용
- 생략된 코드 작성
- 모바일에서 깨지는 레이아웃 작성
- `SUPABASE_SERVICE_ROLE_KEY`를 클라이언트 코드에 사용
- 개인정보를 `console.log`로 출력
