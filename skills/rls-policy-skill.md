# RLS Policy Skill

## 목적

베이비로드 프로젝트에서 Supabase Row Level Security 정책을 안전하게 작성하기 위한 규칙이다.

## 기본 원칙

- 모든 사용자 데이터 테이블은 RLS를 활성화한다
- 사용자는 본인의 데이터만 조회, 등록, 수정, 삭제할 수 있어야 한다
- 아이 관련 데이터는 아이의 소유자인 사용자만 접근할 수 있어야 한다

## RLS 필수 테이블

```
profiles
children
child_growth_records
child_feeding_records
child_sleep_records
child_health_records
child_vaccination_records
community_posts
community_comments
community_likes
community_reports
notifications
```

## 공개 조회 가능 테이블

아래 테이블은 공개 조회가 가능할 수 있다.

```
vaccines, vaccine_schedules
development_contents, development_checklists
community_posts, community_comments
```

단, 공개 조회 테이블도 숨김·삭제·신고 상태는 필터링해야 한다.

## RLS 활성화

```sql
ALTER TABLE public.table_name ENABLE ROW LEVEL SECURITY;
```

## profiles 정책

```sql
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## children 정책

```sql
CREATE POLICY "children_select_own"
ON public.children FOR SELECT TO authenticated
USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "children_insert_own"
ON public.children FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "children_update_own"
ON public.children FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "children_delete_own"
ON public.children FOR DELETE TO authenticated
USING (user_id = auth.uid());
```

## 아이 기록 테이블 정책

적용 대상: `child_growth_records`, `child_feeding_records`, `child_sleep_records`, `child_health_records`, `child_vaccination_records`

공통 패턴 (테이블명만 변경):

```sql
CREATE POLICY "records_select_own"
ON public.child_growth_records FOR SELECT TO authenticated
USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "records_insert_own"
ON public.child_growth_records FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "records_update_own"
ON public.child_growth_records FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "records_delete_own"
ON public.child_growth_records FOR DELETE TO authenticated
USING (user_id = auth.uid());
```

## child_id 소유권 강화

보안을 강화할 때 child_id가 실제 본인의 아이인지 확인:

```sql
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.children c
    WHERE c.id = child_id
      AND c.user_id = auth.uid()
      AND c.deleted_at IS NULL
  )
)
```

## 커뮤니티 게시글 정책

```sql
-- 공개 조회: active 상태 + 삭제되지 않은 게시글
CREATE POLICY "community_posts_public_select"
ON public.community_posts FOR SELECT TO anon, authenticated
USING (status = 'active' AND deleted_at IS NULL);

-- 작성: 로그인 사용자만
CREATE POLICY "community_posts_insert_auth"
ON public.community_posts FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 수정/삭제: 작성자만
CREATE POLICY "community_posts_update_own"
ON public.community_posts FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
```

## 댓글 정책

- 공개 조회 가능 (active 상태만)
- 작성은 로그인 사용자만
- 수정은 작성자만

## 좋아요 정책

- 로그인 사용자만 등록 가능
- 본인의 좋아요만 삭제 가능
- 중복 좋아요 방지: unique index 사용

```sql
CREATE UNIQUE INDEX community_likes_user_post_unique
ON public.community_likes(user_id, post_id)
WHERE deleted_at IS NULL;
```

## 신고 정책

- 로그인 사용자만 등록 가능
- 신고 내역은 본인 또는 관리자만 조회 가능
- 일반 사용자가 전체 신고 내역을 볼 수 없어야 한다

## 관리자 정책

`profiles.role = 'admin'` 기준으로 확장:

```sql
EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.user_id = auth.uid()
    AND p.role = 'admin'
    AND p.deleted_at IS NULL
)
```

## Soft Delete 주의사항

- SELECT 정책에는 `deleted_at IS NULL` 조건을 포함한다
- DELETE 권한 대신 `deleted_at` 업데이트(UPDATE) 방식을 우선한다

## 완료 기준

- RLS가 활성화되어 있는가
- 본인 데이터만 조회 / 등록 / 수정 가능한가
- 다른 사용자의 `child_id`로 등록할 수 없는가
- 커뮤니티 공개 범위가 적절한가
- 신고 내역이 공개되지 않는가
- 관리자 정책이 분리되어 있는가

## 금지사항

- RLS 비활성 상태로 사용자 데이터 운영
- `USING (true)`를 개인정보 테이블에 사용
- `anon`에게 개인정보 조회 권한 부여
- `child_id` 소유권 확인 없는 기록 등록
- 신고 데이터를 공개 조회로 오픈
- `service role key`로 RLS를 우회하는 일반 기능 작성
