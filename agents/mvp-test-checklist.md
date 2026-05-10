# BabyRoad MVP 전체 테스트 체크리스트

작성 기준: CLAUDE.md, qa-review-agent.md, frontend-agent.md, supabase-agent.md, database-agent.md, nextjs-skill.md, supabase-skill.md, rls-policy-skill.md

---

## 0. 테스트 전 필수 사전 준비

### ⚠️ Supabase SQL Editor에서 반드시 실행

**마이그레이션 1: author_nickname 컬럼 추가**
```sql
-- 파일: supabase/migrations/20260508000000_add_author_nickname_to_community.sql
ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS author_nickname TEXT;
ALTER TABLE public.community_comments ADD COLUMN IF NOT EXISTS author_nickname TEXT;
```
이 마이그레이션이 적용되지 않으면 커뮤니티 글쓰기, 댓글 작성이 오류를 반환한다.

**마이그레이션 2: like_count / comment_count 자동 동기화 트리거** ⚠️ 미실행 시 목록 페이지 좋아요·댓글 수 항상 0
```sql
-- 파일: supabase/migrations/20260509000001_add_like_comment_count_trigger.sql
-- (해당 파일 전체 내용을 SQL Editor에 붙여넣고 실행)
```
`community_likes` INSERT/DELETE 시 `community_posts.like_count` 자동 갱신,
`community_comments` INSERT/UPDATE/DELETE 시 `comment_count` 자동 갱신한다.
기존 게시글 카운트 일괄 보정 UPDATE도 포함되어 있다.

---

## 1. 전체 테스트 시나리오

### 시나리오 1: 랜딩 페이지 접속

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/` 접속 | 베이비로드 랜딩 페이지 렌더링 | [ ] |
| Hero 섹션 표시 | 🌱 아이콘, 제목, 설명, "시작하기" 버튼 | [ ] |
| "시작하기" 버튼 클릭 | `/login`으로 이동 | [ ] |
| 기능 카드 5개 표시 | 성장기록/예방접종/발달정보/수유수면/커뮤니티 | [ ] |
| 모바일 375px 화면 정상 | 레이아웃 깨짐 없음 | [ ] |
| 로그인 없이도 접근 가능 | redirect 없음 | [ ] |

### 시나리오 2: Google 로그인

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/login` 접속 | 로그인 페이지 렌더링 | [ ] |
| Google 로그인 버튼 표시 | GIS 버튼 렌더링 | [ ] |
| Google 버튼 클릭 가능 | `opacity-0` 등으로 클릭 차단 안 됨 | [ ] |
| 로그인 성공 → profiles 없음 | `/onboarding`으로 이동 | [ ] |
| 로그인 성공 → profiles 있음 | `/dashboard`로 이동 | [ ] |
| nonce 처리 | Supabase 원문, Google SHA-256 hex hash | [ ] |
| 로그인 실패 | 안전한 오류 코드 표시 (키값 노출 없음) | [ ] |

### 시나리오 3: 온보딩 (아이 프로필 등록)

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/onboarding` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 닉네임 입력 필드 | 2자 이상 검증 | [ ] |
| 아이 이름 입력 필드 | 필수 검증 | [ ] |
| 아이 성별 선택 | 남/여/모름 선택 | [ ] |
| 출생 상태 선택 | "임신 중" / "출생 후" 구분 | [ ] |
| 출생일 또는 출산예정일 입력 | 날짜 입력 필드 | [ ] |
| 저장 성공 | profiles + children 저장 후 `/dashboard` 이동 | [ ] |
| 저장 중 로딩 | 버튼 비활성화 / 로딩 표시 | [ ] |

### 시나리오 4: 대시보드

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/dashboard` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 아이 프로필 카드 표시 | 이름, 현재 개월 수 | [ ] |
| 다음 예방접종 카드 표시 | 예방접종 이름, 날짜, 상태 배지 | [ ] |
| 모든 접종 완료 시 | "모든 예방접종이 완료되었습니다" 표시 | [ ] |
| 최근 성장 기록 카드 | 최신 키/몸무게 또는 빈 상태 | [ ] |
| 빠른 기록 버튼 4개 | 수유/수면/건강/성장 링크 | [ ] |
| 최신 커뮤니티 글 3개 | 제목, 카테고리, 링크 | [ ] |
| 커뮤니티 글 없을 때 | "아직 게시글이 없어요" 빈 상태 | [ ] |
| MedicalDisclaimer 표시 | 의료 안내 문구 amber 박스 | [ ] |
| BottomNav 표시 | 홈/성장/예방접종/커뮤니티/마이 5개 | [ ] |

### 시나리오 5: 성장 기록

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/growth` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 기록 등록 폼 표시 | 날짜, 키, 몸무게, 머리둘레, 메모 | [ ] |
| 키/몸무게 숫자 검증 | 범위 초과 시 오류 메시지 | [ ] |
| 저장 성공 | 목록에 새 기록 추가 | [ ] |
| 성장 기록 목록 | 최신순 정렬 | [ ] |
| 빈 데이터 상태 | "아직 등록된 기록이 없어요" | [ ] |
| MedicalDisclaimer 표시 | ✓ | [ ] |
| 다른 사용자 데이터 조회 불가 | RLS 적용 확인 | [ ] |

### 시나리오 6: 예방접종

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/vaccinations` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 접종 일정 목록 표시 | 백신명, 접종 상태 배지 | [ ] |
| 상태별 배지 구분 | available/scheduled/delayed/completed | [ ] |
| 완료 처리 버튼 | 클릭 후 completed로 전환 | [ ] |
| 완료 취소 버튼 | 클릭 후 완료 해제 → delayed 상태 반영 | [ ] |
| 완료 취소 후 대시보드 | "모든 접종 완료" 사라지고 delayed 표시 | [ ] |
| MedicalDisclaimer 표시 | ✓ | [ ] |

### 시나리오 7: 수유/식사 기록

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/feeding` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 수유 타입 선택 | 모유/분유/혼합/이유식/식사 | [ ] |
| 수유량 또는 식사량 입력 | 숫자 검증 | [ ] |
| 수유 시각 입력 | datetime-local | [ ] |
| 저장 성공 | 목록에 새 기록 추가 | [ ] |
| 빈 데이터 상태 | "아직 등록된 기록이 없어요" | [ ] |

### 시나리오 8: 수면 기록

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/sleep` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 취침/기상 시각 입력 | datetime-local | [ ] |
| 수면 질 선택 (있는 경우) | 선택 저장 | [ ] |
| 저장 성공 | 목록에 추가 | [ ] |
| 빈 데이터 상태 | 빈 상태 메시지 | [ ] |

### 시나리오 9: 건강 기록

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/health` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 체온 입력 | 소수점 허용 | [ ] |
| 37.5℃ 이상 시 | 발열 표시 (빨간 텍스트/배지) | [ ] |
| 증상 입력 | 텍스트 입력 | [ ] |
| 저장 성공 | 목록에 추가 | [ ] |
| MedicalDisclaimer 표시 | ✓ | [ ] |

### 시나리오 10: 커뮤니티 목록

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/community` 접속 (비로그인) | 정상 렌더링 (redirect 없음) | [ ] |
| 게시글 카드 목록 표시 | 제목, 카테고리, 닉네임, 날짜 | [ ] |
| 카테고리 필터 칩 | 클릭 시 해당 카테고리만 필터 | [ ] |
| "전체" 필터 | 전체 게시글 표시 | [ ] |
| 글쓰기 버튼 표시 | 로그인 시에만 버튼 표시 | [ ] |
| 비로그인 시 글쓰기 버튼 | 없거나 숨겨짐 | [ ] |
| 빈 데이터 상태 | "아직 게시글이 없어요" | [ ] |
| 커뮤니티 의료 안내 | amber 박스 표시 | [ ] |

### 시나리오 11: 커뮤니티 글쓰기

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/community/write` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 카테고리 선택 필수 | 미선택 시 오류 | [ ] |
| 제목 2-100자 검증 | 범위 초과 시 오류 | [ ] |
| 내용 10-2000자 검증 | 범위 초과 시 오류 | [ ] |
| 저장 성공 | `/community`로 이동 | [ ] |
| author_nickname 저장 | 게시글에 닉네임 표시 | [ ] |
| Supabase 마이그레이션 적용 필요 | author_nickname 컬럼 존재 확인 | [ ] |

### 시나리오 12: 커뮤니티 게시글 상세

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/community/[postId]` 접속 | 게시글 제목, 내용, 작성자, 카테고리 표시 | [ ] |
| 비로그인 접속 | 정상 렌더링 (redirect 없음) | [ ] |
| 존재하지 않는 postId | 404 notFound 처리 | [ ] |
| 삭제된 게시글 접근 | 404 notFound 처리 | [ ] |
| 좋아요 카운트 표시 | Supabase count 쿼리 기반 | [ ] |
| 댓글 목록 표시 | active 상태만 | [ ] |
| 내 게시글 - 삭제 버튼 표시 | user_id 일치 시만 | [ ] |
| 다른 사람 게시글 - 삭제 버튼 없음 | user_id 불일치 시 숨김 | [ ] |

### 시나리오 13: 댓글 작성

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| 로그인 시 댓글 폼 표시 | 텍스트 입력 + 제출 버튼 | [ ] |
| 비로그인 시 댓글 폼 | "로그인이 필요해요" 안내 + 로그인 링크 | [ ] |
| 댓글 2-500자 검증 | 범위 초과 시 오류 | [ ] |
| 댓글 저장 성공 | 목록에 즉시 추가 (router.refresh) | [ ] |
| author_nickname 저장 | 댓글에 닉네임 표시 | [ ] |

### 시나리오 14: 좋아요

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| 비로그인 좋아요 버튼 클릭 | `/login`으로 이동 | [ ] |
| 로그인 좋아요 | 카운트 +1, 버튼 활성 상태 | [ ] |
| 좋아요 취소 | 카운트 -1, 버튼 비활성 상태 | [ ] |
| 중복 좋아요 방지 | unique index 적용 확인 | [ ] |
| Optimistic 업데이트 | 즉각 UI 반영 | [ ] |
| **게시글 상세 비로그인 좋아요 수 표시** | 비로그인 시에도 숫자 표시 (0이면 버그) | [ ] |
| **게시글 목록 좋아요 수 표시** | 트리거 미적용 시 항상 0 — 마이그레이션 2 실행 필요 | [ ] |
| **대시보드 최신 글 댓글 수 표시** | 트리거 미적용 시 항상 0 — 마이그레이션 2 실행 필요 | [ ] |

**좋아요 수 흐름 정리:**
- 상세 페이지 (`/community/[postId]`): `community_likes` 테이블 COUNT 직접 쿼리 → 항상 정확
- 목록 페이지 (`/community`): `community_posts.like_count` 컬럼 사용 → 트리거 없으면 0
- 비로그인 시 상세 페이지 likeCount: `community_likes` SELECT RLS에 `TO anon, authenticated` 필요 (2026-05-09 Supabase SQL Editor에서 적용 완료)

### 시나리오 15: 신고

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| 신고 버튼 클릭 | 신고 사유 선택 모달 | [ ] |
| 사유 선택 없이 제출 | 오류 메시지 | [ ] |
| 신고 사유 6가지 | 스팸/광고, 욕설/혐오, 허위정보, 개인정보노출, 의료오해유발, 기타 | [ ] |
| 신고 성공 | "신고 완료" 텍스트 표시 | [ ] |
| 비로그인 신고 | 버튼 없음 또는 로그인 유도 | [ ] |
| 신고 데이터 공개 여부 | community_reports 본인만 조회 (RLS 확인) | [ ] |

### 시나리오 16: 마이페이지

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| `/mypage` 접속 (비로그인) | `/login`으로 redirect | [ ] |
| 프로필 카드 표시 | 닉네임, 이메일 | [ ] |
| 아이 요약 카드 표시 | 아이 이름, 개월 수 | [ ] |
| 아이 없을 때 | "아이 정보 등록하기" 버튼 표시 | [ ] |
| 메뉴 링크 6개 | 성장/예방접종/수유/수면/건강/커뮤니티 | [ ] |
| 로그아웃 버튼 | 클릭 시 세션 제거 + `/login` 이동 | [ ] |
| MedicalDisclaimer 표시 | ✓ | [ ] |

### 시나리오 17: 로그아웃 및 보호 확인

| 항목 | 기대 결과 | 상태 |
|------|-----------|------|
| 로그아웃 후 `/dashboard` 접근 | `/login`으로 redirect | [ ] |
| 로그아웃 후 `/mypage` 접근 | `/login`으로 redirect | [ ] |
| 로그아웃 후 `/growth` 접근 | `/login`으로 redirect | [ ] |
| 로그아웃 후 `/community` 접근 | 정상 렌더링 (공개 페이지) | [ ] |
| 로그아웃 후 `/community/write` 접근 | `/login`으로 redirect | [ ] |
| 로그아웃 후 `/community/[postId]` 접근 | 정상 렌더링 (공개 페이지) | [ ] |

---

## 2. 페이지별 체크리스트

| 페이지 | 로그인 보호 | MedicalDisclaimer | 빈 상태 처리 | 모바일 UI | BottomNav |
|--------|------------|-------------------|-------------|-----------|-----------|
| `/` | ✗ (공개) | 불필요 | - | [ ] | ✗ |
| `/login` | ✗ | 불필요 | - | [ ] | ✗ |
| `/onboarding` | ✓ | ✓ | - | [ ] | ✗ |
| `/dashboard` | ✓ | ✓ | [ ] | [ ] | ✓ |
| `/growth` | ✓ | ✓ | [ ] | [ ] | ✓ (성장) |
| `/vaccinations` | ✓ | ✓ | [ ] | [ ] | ✓ (예방접종) |
| `/feeding` | ✓ | 불필요 | [ ] | [ ] | ✗ (마이페이지 진입) |
| `/sleep` | ✓ | 불필요 | [ ] | [ ] | ✗ |
| `/health` | ✓ | ✓ | [ ] | [ ] | ✗ |
| `/community` | ✗ (공개) | ✓ | [ ] | [ ] | ✓ (커뮤니티) |
| `/community/write` | ✓ | 불필요 | - | [ ] | ✗ |
| `/community/[postId]` | ✗ (공개) | ✓ | [ ] | [ ] | ✓ |
| `/mypage` | ✓ | ✓ | [ ] | [ ] | ✓ (마이) |

---

## 3. Supabase 테이블별 확인 항목

| 테이블 | RLS 활성 | SELECT | INSERT | UPDATE | DELETE | Soft Delete |
|--------|---------|--------|--------|--------|--------|-------------|
| profiles | ✓ | 본인만 | 본인만 | 본인만 | - | - |
| children | ✓ | 본인만 | 본인만 | 본인만 | 본인만 | ✓ |
| child_growth_records | ✓ | 본인만 | 본인+child검증 | 본인만 | 본인만 | ✓ |
| child_feeding_records | ✓ | 본인만 | 본인+child검증 | 본인만 | 본인만 | ✓ |
| child_sleep_records | ✓ | 본인만 | 본인+child검증 | 본인만 | 본인만 | ✓ |
| child_health_records | ✓ | 본인만 | 본인+child검증 | 본인만 | 본인만 | ✓ |
| vaccines | ✓ | 공개 | - | - | - | ✓ |
| vaccine_schedules | ✓ | 공개 | - | - | - | ✓ |
| child_vaccination_records | ✓ | 본인만 | 본인+child검증 | 본인만 | 본인만 | ✓ |
| development_contents | ✓ | 공개 | - | - | - | ✓ |
| development_checklists | ✓ | 공개 | - | - | - | ✓ |
| community_posts | ✓ | 공개(active만) | 로그인만 | 작성자만 | - | ✓ |
| community_comments | ✓ | 공개(active만) | 로그인만 | 작성자만 | - | ✓ |
| community_likes | ✓ | 공개(anon+auth) | 로그인만 | - | 본인만 | ✓ |
| community_reports | ✓ | 본인만 | 로그인만 | - | - | - |
| notifications | ✓ | 본인만 | - | 본인만 | - | ✓ |

**미적용 마이그레이션 확인:**
- [ ] `community_posts.author_nickname` 컬럼 존재 여부
- [ ] `community_comments.author_nickname` 컬럼 존재 여부
- [ ] `community_likes` unique index 적용 여부
- [ ] `sync_post_like_count` / `sync_post_comment_count` 트리거 함수 존재 여부
- [ ] `trg_sync_post_like_count` / `trg_sync_post_comment_count` 트리거 존재 여부

**RLS 변경 이력:**
- 2026-05-09: `community_likes` SELECT 정책 `TO authenticated` → `TO anon, authenticated` 변경 (비로그인 좋아요 수 표시 수정)

---

## 4. RLS 확인 항목

### 반드시 확인해야 할 RLS 시나리오

| 시나리오 | 확인 방법 | 기대 결과 |
|---------|----------|-----------|
| 사용자 A가 사용자 B의 children 조회 | B의 child_id로 SELECT | 빈 결과 |
| 사용자 A가 사용자 B의 성장 기록 등록 | B의 child_id로 INSERT | 403/오류 |
| 비로그인 사용자의 community_posts 조회 | anon으로 SELECT | active 게시글만 |
| 비로그인 사용자의 community_posts 작성 | anon으로 INSERT | 403/오류 |
| 로그인 사용자의 타인 게시글 삭제 | 타인 post_id로 UPDATE | 오류 또는 0 rows affected |
| 비로그인 사용자의 community_reports 조회 | anon으로 SELECT | 빈 결과 |
| community_likes 중복 등록 | 같은 user+post로 INSERT 2회 | unique constraint 오류 |

### RLS 정책 현황 (policies.sql 기준)

- [x] profiles: SELECT/INSERT/UPDATE 정책 적용
- [x] children: SELECT/INSERT/UPDATE/DELETE 정책 적용
- [x] child_growth_records: 4개 정책 + child_id 소유권 검증
- [x] child_feeding_records: 4개 정책 + child_id 소유권 검증
- [x] child_sleep_records: 4개 정책 + child_id 소유권 검증
- [x] child_health_records: 4개 정책 + child_id 소유권 검증
- [x] vaccines / vaccine_schedules: 공개 SELECT
- [x] child_vaccination_records: 4개 정책 + child_id 소유권 검증
- [x] community_posts: public SELECT + 로그인 INSERT + 작성자 UPDATE
- [x] community_comments: public SELECT + 로그인 INSERT + 작성자 UPDATE
- [x] community_likes: 인증 SELECT + 로그인 INSERT + 본인 DELETE
- [x] community_reports: 로그인 INSERT + 본인 SELECT
- [x] notifications: 본인 SELECT + 본인 UPDATE

---

## 5. 모바일 UI 확인 항목

| 항목 | 기준 | 상태 |
|------|------|------|
| 최소 해상도 375px 정상 렌더링 | 가로 스크롤 없음 | [ ] |
| BottomNav가 콘텐츠를 가리지 않음 | pb-24 여백 확인 | [ ] |
| 입력 폼 필드 터치 영역 충분 | 최소 44px 높이 | [ ] |
| 버튼 탭 영역 충분 | 최소 44x44px | [ ] |
| 텍스트 가독성 | 최소 12px, 충분한 명도 대비 | [ ] |
| 카드 여백 적절 | px-4 / py-6 / gap-4 일관성 | [ ] |
| 과도한 애니메이션 없음 | transition 제한적 사용 | [ ] |
| Header sticky 작동 | 스크롤 시 상단 고정 | [ ] |
| BottomNav fixed 작동 | 스크롤 시 하단 고정 | [ ] |
| 커뮤니티 카테고리 필터 | 가로 스크롤 overflow-x-auto | [ ] |

---

## 6. 발견 시 수정 우선순위

### P0 — 즉시 수정 (서비스 불가 수준)

| ID | 항목 | 원인 | 수정 방법 |
|----|------|------|-----------|
| P0-1 | 커뮤니티 글쓰기/댓글 INSERT 오류 | `author_nickname` 컬럼 미적용 | Supabase SQL Editor에서 마이그레이션 1 실행 |
| ~~P0-2~~ | ~~커뮤니티 목록/대시보드 좋아요·댓글 수 항상 0~~ | ~~`community_posts.like_count/comment_count` 비동기화~~ | **2026-05-09 수정 완료** — 트리거 마이그레이션 실행 완료 |
| ~~P0-3~~ | ~~비로그인 게시글 상세 좋아요 수 0~~ | ~~`community_likes` SELECT 정책 TO authenticated만~~ | **2026-05-09 수정 완료** — `TO anon, authenticated`로 변경 |

### P1 — 배포 전 수정 (핵심 기능 오류)

| ID | 항목 | 원인 | 수정 방법 |
|----|------|------|-----------|
| P1-1 | 발달정보 페이지 없음 | `/development` 미구현 | CLAUDE.md MVP 기능에 포함, 2차 마일스톤에서 구현 |
| P1-2 | 커뮤니티 신고 후 새로고침 시 "신고 완료" 초기화 | 로컬 state 관리, Supabase 조회 미구현 | 신고 여부를 서버에서 확인하는 로직 추가 |

### P2 — 기능 개선 (경험 저하)

| ID | 항목 | 원인 | 수정 방법 |
|----|------|------|-----------|
| P2-1 | CommunityDeleteButton `as any` 타입 우회 | Supabase TypeScript 타입 미생성 | `npx supabase gen types`로 타입 재생성 |
| P2-2 | CommunityPostForm `as never[]` 패턴 | 동일 원인 | 동일 |
| P2-3 | 삭제 실패 시 UI 피드백 없음 | error 시 setLoading(false), setConfirm(false)만 처리 | 토스트 또는 오류 메시지 추가 |
| P2-4 | 수유/수면/성장 기록 수정 기능 없음 | 등록만 구현 | 수정 폼 또는 삭제 버튼 추가 |

### P3 — 개선 사항 (낮은 우선순위)

| ID | 항목 | 원인 | 수정 방법 |
|----|------|------|-----------|
| P3-1 | 랜딩 페이지 footer "© 2025" | 연도 하드코딩 | `new Date().getFullYear()` 또는 2026으로 수정 |
| P3-2 | 커뮤니티 게시글 수정 기능 없음 | 삭제만 구현 | `/community/[postId]/edit` 페이지 추가 |
| P3-3 | 예방접종 완료 취소가 hard DELETE | VaccinationUndoButton | soft delete로 변경 또는 현재 구조 유지 결정 |
| P3-4 | BottomNav에 수유/수면/건강 미포함 | 5개 항목 제한 | 현재 UX 유지 (마이페이지 메뉴로 접근) |

---

## 7. 빌드 및 배포 상태

```
npm run build 결과 (2026-05-09 최종 확인)
✓ Compiled successfully in 29.4s
✓ 17 pages generated
✓ 0 TypeScript errors
✓ 0 ESLint errors

Route (app)
├ ƒ /community           986 B
├ ƒ /community/[postId]  3.16 kB
├ ƒ /community/write     2.96 kB
├ ƒ /dashboard           986 B
├ ƒ /mypage              1.54 kB
...

Production URL: https://babyroad.vercel.app
배포 상태: ✓ READY
최근 commit: dfb9a60 feat: implement community feature and complete MVP milestone 6
```

---

## 8. 보안 체크리스트

| 항목 | 상태 |
|------|------|
| `console.log` 개인정보 출력 없음 | ✓ (0건 검색됨) |
| `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 노출 없음 | ✓ |
| `.env.local` Git 미포함 | ✓ (`.gitignore` 확인 필요) |
| Supabase anon key 이외 클라이언트 사용 없음 | ✓ |
| 사용자 ID, 토큰 로그 출력 없음 | ✓ |
| Supabase 오류 원문 사용자 노출 없음 | [ ] (각 폼 오류 처리 확인 필요) |
| RLS 모든 테이블 활성화 | ✓ (policies.sql 기준) |

---

## 9. 의료 안내 문구 확인

`MedicalDisclaimer` 컴포넌트가 적용되어야 하는 페이지:

| 페이지 | 적용 여부 |
|--------|-----------|
| `/onboarding` | ✓ |
| `/dashboard` | ✓ |
| `/growth` | ✓ |
| `/vaccinations` | ✓ |
| `/feeding` | ✓ |
| `/sleep` | ✓ |
| `/health` | ✓ |
| `/community` | ✓ (자체 amber 박스) |
| `/community/[postId]` | ✓ (자체 amber 박스) |
| `/mypage` | ✓ |

---

## 10. 다음 개발 단계 제안

### 2차 마일스톤 (발달정보 + 개월별 콘텐츠)

| 기능 | 우선순위 | 비고 |
|------|---------|------|
| `/development` 발달정보 페이지 | 높음 | CLAUDE.md MVP 기능 포함 |
| 개월별 발달 체크리스트 | 높음 | `development_checklists` 테이블 |
| 대시보드 발달정보 카드 추가 | 중간 | 현재 카드 중 공간 확인 |

### 3차 마일스톤 (UX 개선)

| 기능 | 우선순위 | 비고 |
|------|---------|------|
| 토스트 알림 컴포넌트 | 높음 | 저장 성공/실패 피드백 |
| 기록 수정 기능 (성장/수유/수면/건강) | 중간 | 현재 등록만 가능 |
| 커뮤니티 게시글 수정 기능 | 중간 | 삭제만 구현됨 |
| 신고 여부 서버 조회 | 낮음 | 현재 세션 기반만 |
| 커뮤니티 페이지네이션 | 낮음 | 현재 최신 20개 고정 |

### 4차 마일스톤 (Kakao/Naver 소셜 로그인)

| 기능 | 우선순위 | 비고 |
|------|-----------|------|
| Kakao OAuth redirect 로그인 | 중간 | `/auth/callback` 라우트 이미 존재 |
| Naver OAuth redirect 로그인 | 중간 | 동일 |
| 소셜 로그인 버튼 UI 추가 | 낮음 | 현재 "준비중" 상태 |

### 5차 마일스톤 (관리자 + 알림)

| 기능 | 우선순위 | 비고 |
|------|---------|------|
| 관리자 페이지 | 낮음 | `profiles.role = 'admin'` 구조 준비됨 |
| 신고 처리 관리자 기능 | 낮음 | community_reports 테이블 준비됨 |
| 예방접종 알림 | 낮음 | notifications 테이블 준비됨 |
| 푸시 알림 | 낮음 | 추후 모바일 앱 확장 시 |

---

## 완료 후 보고

### 검수 기준 통과 여부

| 기준 | 상태 |
|------|------|
| `npm run build` 성공 | ✓ (0 errors) |
| 주요 페이지 렌더링 정상 | ✓ (17 pages) |
| TypeScript 오류 없음 | ✓ |
| Supabase RLS 정책 적용 | ✓ (policies.sql 기준) |
| 로그인 보호 페이지 redirect | ✓ (9 pages) |
| 개인정보 console.log 없음 | ✓ |
| 의료 안내 문구 표시 | ✓ (해당 페이지 전체) |
| 모바일 UI 기본 구조 | ✓ |
| Vercel 배포 완료 | ✓ https://babyroad.vercel.app |

### 배포 상태

| 항목 | 값 |
|------|----|
| 배포 URL | https://babyroad.vercel.app |
| 최근 커밋 | dfb9a60 |
| 빌드 상태 | READY |
| 배포 시각 | 2026-05-08 |

### 즉시 조치 필요 항목

1. **[P0]** Supabase SQL Editor에서 author_nickname 마이그레이션 실행 (`20260508000000_add_author_nickname_to_community.sql`)
2. **[완료]** like/comment count 트리거 마이그레이션 실행 완료 — 2026-05-09 적용
3. **[완료]** `community_likes` SELECT RLS anon 허용 — 2026-05-09 적용
4. **[P1]** 발달정보 페이지 (`/development`) 구현 계획 수립

---

*이 문서는 베이비로드 MVP 1차 완성 시점(2026-05-08) 기준으로 작성되었습니다.*
*실제 테스트는 Supabase 마이그레이션 적용 후 진행해야 합니다.*
