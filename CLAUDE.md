# 베이비로드 BabyRoad 개발 지침

## 1. 프로젝트 개요

베이비로드는 임신부터 초등학교 입학 전까지 아이의 성장, 발달, 예방접종, 식사, 수면, 건강기록을 관리하고 부모 커뮤니티를 제공하는 육아 성장 관리 서비스다.

초기 MVP는 무료 인프라를 우선 사용한다.

- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Supabase (PostgreSQL, Auth, Storage)
- Hosting: Vercel
- 협업 AI: Claude Code, Codex

## 2. MVP 필수 기능

- 소셜 로그인 (Google, Kakao, Naver)
- 회원 프로필 / 아이 프로필 등록
- 임신 중 / 출생 후 상태 구분
- 출산예정일 또는 출생일 기준 자동 계산
- 성장 기록 / 성장 그래프
- 예방접종 일정 / 완료 기록
- 개월별 발달 정보
- 수유 / 식사 기록
- 수면 기록
- 건강 기록
- 커뮤니티
- 마이페이지

## 3. 프로젝트 구조

```
babyroad/
├── CLAUDE.md
├── README.md
├── package.json
├── .env.local.example
├── app/
├── components/
├── lib/
├── types/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── policies.sql
├── docs/
├── agents/
└── skills/
```

## 4. 역할 분리

상세 개발 규칙은 CLAUDE.md에 모두 넣지 않는다. 각 역할은 agents/, 반복 패턴은 skills/ 폴더에서 관리한다.

**agents/**

- `product-planner-agent.md`
- `frontend-agent.md`
- `database-agent.md`
- `supabase-agent.md`
- `auth-agent.md`
- `deploy-agent.md`
- `qa-review-agent.md`

**skills/**

- `nextjs-skill.md`
- `supabase-skill.md`
- `vercel-deploy-skill.md`
- `rls-policy-skill.md`
- `oauth-login-skill.md`
- `database-schema-skill.md`

## 5. 개발 원칙

- App Router 기반 Next.js + TypeScript + Tailwind CSS
- Supabase Auth / PostgreSQL / Storage 사용
- 모든 사용자 데이터 테이블에 RLS 필수 적용
- 사용자는 본인 데이터만 조회·등록·수정·삭제 가능
- 클라이언트 코드에 `SUPABASE_SERVICE_ROLE_KEY` 노출 금지
- 환경변수는 `.env.local`과 Vercel Environment Variables에서 관리
- 모바일 우선 UI
- 실제 배포 가능한 완성 코드만 작성 (생략 코드 금지)

## 6. Supabase 기본 규칙

- Auth 사용자 ID는 `auth.users.id` 기준으로 연결
- 사용자 프로필 → `profiles` 테이블
- 아이 정보 → `children` 테이블
- 사용자 소유 데이터는 반드시 `user_id` 포함
- 아이 관련 데이터는 반드시 `child_id` 포함
- 모든 주요 테이블에 `created_at`, `updated_at`, `deleted_at` 포함
- 삭제 가능한 데이터는 soft delete 처리
- RLS 정책 없이 개인정보 테이블 생성 금지

## 7. 주요 테이블 (MVP 기준)

```
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

## 8. 인증 흐름

1. 사용자 로그인 (Google 우선, Kakao / Naver 확장 예정)
2. Google은 Google Identity Services로 ID Token을 받은 뒤 `supabase.auth.signInWithIdToken`으로 Supabase Auth 세션 생성
3. Google ID Token 로그인 시 nonce는 원문 nonce를 Supabase에 전달하고, Google에는 SHA-256 hex 형식의 nonce hash를 전달
4. Kakao / Naver 등 redirect OAuth 제공자는 필요 시 `/auth/callback` 기반 서버 콜백으로 확장
5. `profiles` 테이블에 프로필 존재 여부 확인
6. 프로필 없음 → 온보딩으로 이동
7. 프로필 있음 → 대시보드로 이동

## 9. UI/UX 기준

- 모바일 우선
- 따뜻하고 신뢰감 있는 육아 서비스 톤
- 홈 화면은 카드형 UI
- 입력 화면은 단순하고 빠른 기록 중심
- 과도한 애니메이션 금지

**기본 메뉴:** 홈 / 성장기록 / 예방접종 / 발달정보 / 식사 / 수면 / 건강 / 커뮤니티 / 마이페이지

## 10. 의료 정보 안내 문구

성장, 발달, 예방접종, 건강 관련 화면에 반드시 표시:

> 본 앱에서 제공하는 성장, 발달, 예방접종, 건강 정보는 일반적인 참고 정보입니다.
> 아이의 건강 상태, 질병, 발달 지연, 접종 가능 여부는 반드시 전문 의료진과 상담해 주세요.

## 11. 보안 기준

- RLS 필수 적용 / 사용자별 데이터 접근 제한
- `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출 금지
- `.env.local` Git 업로드 금지
- 개인정보 `console.log` 출력 금지
- 이미지 업로드 시 파일 크기, MIME 타입 검증
- 커뮤니티 신고 기능 포함
- 관리자 권한은 별도 role로 분리
- 의료 진단처럼 보이는 문구 작성 금지
- 공식 검증 없는 성장 기준을 확정값처럼 표시 금지

## 12. 환경변수 (.env.local.example)

```env
NEXT_PUBLIC_APP_NAME=BabyRoad
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=

NEXT_PUBLIC_NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=

NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

- `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용
- 브라우저 코드에서는 `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 사용
- Vercel 환경변수 Value에는 값만 입력한다. `NEXT_PUBLIC_SUPABASE_ANON_KEY=`처럼 키 이름을 함께 넣거나 줄바꿈/중복 값을 넣지 않는다.
- Google ID Token 로그인에 필요한 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`는 브라우저에서 사용 가능하다.
- Google Cloud OAuth Client에는 `https://babyroad.vercel.app`, `http://localhost:3000`을 Authorized JavaScript origins에 등록한다.
- redirect OAuth를 함께 사용하는 경우 Google Cloud Authorized redirect URIs에는 Supabase Callback URL (`https://<project-ref>.supabase.co/auth/v1/callback`)을 등록한다.

## 환경변수 보안 추가 규칙

- `.env.local` 파일은 실제 비밀 키가 들어있는 로컬 전용 파일이므로 내용을 읽거나 출력하지 않는다.
- 필요한 환경변수 이름은 `.env.local.example` 파일을 기준으로만 확인한다.
- 실제 키값을 답변에 출력하지 않는다.
- 실제 키값을 코드에 하드코딩하지 않는다.
- 실제 키값을 다른 파일로 복사하지 않는다.
- `SUPABASE_SERVICE_ROLE_KEY`, OAuth Client Secret, DB Password는 절대 클라이언트 코드에 사용하지 않는다.
- Google 로그인 구현은 Client Secret 없이 `NEXT_PUBLIC_GOOGLE_CLIENT_ID`와 Google Identity Services ID Token을 사용한다.

## 13. 작업 방식

1. 관련 agent 문서 확인 (`agents/`)
2. 관련 skill 문서 확인 (`skills/`)
3. 현재 프로젝트 구조 확인
4. 필요한 파일 목록 정리
5. 파일 단위로 완성 코드 작성
6. Supabase 테이블 또는 RLS 필요 여부 확인
7. 환경변수 필요 여부 안내
8. 실행 방법 및 테스트 방법 안내

## 14. 작업 완료 기준

1. 실제 실행 가능한가
2. TypeScript 오류가 없는가
3. 모바일 화면에서 정상 작동하는가
4. Supabase와 정상 연동되는가
5. RLS 정책이 적용되어 있는가
6. 로그인 사용자의 데이터만 조회되는가
7. 입력값 검증이 있는가
8. 개인정보가 노출되지 않는가
9. Vercel 배포가 가능한가

## 15. 금지사항

- 생략된 코드 작성
- 실행 불가능한 예시 코드 작성
- RLS 없는 사용자 데이터 테이블 생성
- `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출
- 공식 검증 없는 성장 기준을 확정값처럼 표시
- 의료 진단처럼 보이는 문구 작성
- 개인정보 로그 출력
- 사용자가 다른 사용자의 아이 정보를 볼 수 있는 구조

## 16. 최종 목표

임신부터 7세까지 아이의 성장 여정을 관리하는 육아 플랫폼. 초기에는 Supabase + Vercel 무료 인프라 기반 MVP로 시작하고, 이후 모바일 앱, 관리자 시스템, 푸시 알림, AI 요약, 프리미엄 리포트 기능으로 확장한다.



## 17. 마일스톤 배포 규칙

마일스톤 완료 기준과 배포 여부 판단은 `agents/milestones.md`를 따른다.

베이비로드 프로젝트는 기본적으로 로컬 개발을 우선한다.

일반 기능 개발 중에는 Vercel Production 배포를 하지 않는다.

단, 현재 작업이 `agents/milestones.md`의 마일스톤 완료 기준을 충족하는 경우에는 `agents/qa-review-agent.md` 기준으로 QA 검수 후 GitHub push와 Vercel Production 배포까지 진행한다.

마일스톤 완료 기준을 충족하지 못하면 Vercel 배포는 하지 않고 로컬 빌드 확인까지만 진행한다.

### 마일스톤 작업 원칙

- 일반 작업 완료 시에는 `npm run build`와 `git status`까지만 확인한다.
- 마일스톤 완료 시에는 QA 검수 후 commit, push, Vercel Production 배포까지 진행한다.
- 배포 여부는 `agents/milestones.md` 기준으로 판단한다.
- QA 검수는 `agents/qa-review-agent.md` 기준으로 진행한다.
- 배포 절차는 `agents/deploy-agent.md` 기준으로 진행한다.
- `.env.local` 파일은 절대 읽거나 덮어쓰지 않는다.
- 실제 환경변수 값은 출력하지 않는다.
- 빌드 실패 상태에서는 배포하지 않는다.
