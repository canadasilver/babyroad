# 베이비로드 마일스톤 및 배포 규칙

## 1. 기본 원칙

베이비로드 프로젝트는 기본적으로 로컬 개발을 우선한다.

일반 기능 개발 중에는 Vercel Production 배포를 하지 않는다.

단, 작업 결과가 아래 마일스톤 중 하나를 완료하는 경우에는 `agents/qa-review-agent.md` 기준으로 QA 검수 후 GitHub push와 Vercel Production 배포까지 진행한다.

---

## 2. 마일스톤 1: 기본 세팅 완료

### 완료 기준

- Supabase 연결 완료
- Vercel 배포 완료
- Google 로그인 완료
- 온보딩 완료
- 대시보드에서 아이 정보 표시 완료

### 상태

완료

---

## 3. 마일스톤 2: 성장 기록 완료

### 완료 기준

- 성장 기록 등록 가능
- 성장 기록 목록 조회 가능
- 대시보드 최근 성장 기록 반영
- 로그인 사용자 본인 아이 데이터만 저장
- 모바일 UI 정상
- `npm run build` 성공
- QA Review Agent 검수 통과

### 상태

진행 중

---

## 4. 마일스톤 3: 예방접종 완료

### 완료 기준

- 아이 출생일 기준 예방접종 일정 표시
- 다음 예방접종 카드 표시
- 접종 완료 기록 가능
- 접종 상태 변경 가능
- 대시보드 다음 예방접종 반영
- 의료 안내 문구 표시
- `npm run build` 성공
- QA Review Agent 검수 통과

### 상태

대기

---

## 5. 마일스톤 4: 육아 기록 완료

### 완료 기준

- 수유 기록 등록 / 조회
- 수면 기록 등록 / 조회
- 건강 기록 등록 / 조회
- 대시보드 최근 기록 반영
- 모바일 UI 정상
- `npm run build` 성공
- QA Review Agent 검수 통과

### 상태

대기

---

## 6. 마일스톤 5: 커뮤니티 기본 완료

### 완료 기준

- 게시글 목록 조회
- 게시글 작성
- 게시글 상세
- 댓글 작성
- 좋아요
- 신고 구조
- 로그인 사용자 권한 적용
- `npm run build` 성공
- QA Review Agent 검수 통과

### 상태

대기

---

## 7. 마일스톤 6: MVP 1차 완성

### 완료 기준

- 로그인
- 온보딩
- 대시보드
- 성장 기록
- 예방접종
- 수유 / 수면 / 건강 기록
- 커뮤니티 기본
- 모바일 UI 검수
- RLS 검수
- 보안 검수
- `npm run build` 성공
- Vercel 운영 배포 성공

### 상태

대기

---

## 8. 일반 작업 방식

일반 작업 완료 시에는 아래까지만 진행한다.

```bash
npm run build
git status
```

그리고 변경 파일, 테스트 방법, 다음 작업을 보고한다.

---

## 9. 마일스톤 완료 시 작업 방식

현재 작업이 마일스톤 완료 기준을 충족하면 아래 순서까지 진행한다.

```bash
npm run build
git status
git add .
git commit -m "마일스톤 내용에 맞는 커밋 메시지"
git push origin main
npx vercel --prod
```

---

## 10. Vercel CLI 응답 기준

배포 중 질문이 나오면 아래 기준을 따른다.

```text
Set up and deploy? yes
Which scope? canadasilver 또는 현재 연결된 계정
Link to existing project? yes
Project name? babyroad
Directory? ./
Pull environment variables? no
Found existing .env.local. Overwrite? no
```

특히 아래 질문은 반드시 `no`로 답한다.

```text
Would you like to pull Environment Variables now? no
Found existing file ".env.local". Do you want to overwrite? no
```

---

## 11. 마일스톤 완료 판단 기준

마일스톤 완료 여부는 아래 기준으로 판단한다.

- 해당 마일스톤의 필수 기능이 모두 구현되었는가
- 로컬에서 주요 화면 테스트가 가능한가
- Supabase 저장 / 조회가 정상인가
- RLS 정책과 충돌하지 않는가
- 모바일 UI가 깨지지 않는가
- `npm run build`가 성공하는가
- `agents/qa-review-agent.md` 기준 검수를 통과했는가

위 조건을 모두 만족하지 못하면 배포하지 않는다.

---

## 12. 보안 주의

- `.env.local` 파일은 절대 읽지 않는다.
- `.env.local`을 덮어쓰지 않는다.
- 실제 환경변수 값을 출력하지 않는다.
- 실제 키값을 코드에 하드코딩하지 않는다.
- OAuth Client Secret을 코드에 넣지 않는다.
- `SUPABASE_SERVICE_ROLE_KEY`는 사용하지 않는다.
- Vercel 환경변수 값을 출력하지 않는다.
- 빌드 실패 상태에서 배포하지 않는다.

---

## 13. 완료 보고 형식

작업 완료 후 아래 형식으로 보고한다.

```markdown
## 작업 요약

## 현재 마일스톤

## 마일스톤 완료 여부

## 생성 파일

## 수정 파일

## QA 검수 결과

## npm run build 결과

## Git commit 여부

## Vercel 배포 여부

## 테스트 URL

## 다음 작업
```

---

## 14. 작업 지시문에 붙일 문구

앞으로 기능 개발 요청 마지막에 아래 문구를 붙인다.

```markdown
작업 완료 후 현재 작업이 마일스톤 완료 기준에 해당하는지 판단해줘.
마일스톤 완료 기준을 충족하면 `agents/qa-review-agent.md`와 `docs/milestones.md` 기준으로 검수 후 git commit, push, Vercel production 배포까지 진행해줘.
마일스톤 완료가 아니면 Vercel 배포는 하지 말고 로컬 빌드 확인까지만 진행해줘.
.env.local은 읽거나 덮어쓰지 마.
```
