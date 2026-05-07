-- ============================================================
-- BabyRoad RLS Policies
-- 파일: supabase/policies.sql
--
-- 실행 전제: 202605070001_create_initial_schema.sql 실행 완료
-- 재실행 안전: DROP POLICY IF EXISTS 후 재생성
-- ============================================================

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

-- 본인 프로필만 조회
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 본인 user_id로만 등록
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 본인 프로필만 수정
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- children
-- ============================================================
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "children_select_own" ON public.children;
DROP POLICY IF EXISTS "children_insert_own" ON public.children;
DROP POLICY IF EXISTS "children_update_own" ON public.children;
DROP POLICY IF EXISTS "children_delete_own" ON public.children;

-- 소프트 삭제되지 않은 본인 아이만 조회
CREATE POLICY "children_select_own"
  ON public.children FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "children_insert_own"
  ON public.children FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "children_update_own"
  ON public.children FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 물리 삭제 허용 (소프트 삭제 대신 완전 삭제가 필요한 경우)
CREATE POLICY "children_delete_own"
  ON public.children FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- child_growth_records
-- ============================================================
ALTER TABLE public.child_growth_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "growth_select_own" ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_insert_own" ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_update_own" ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_delete_own" ON public.child_growth_records;

CREATE POLICY "growth_select_own"
  ON public.child_growth_records FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- INSERT: user_id 일치 + child_id가 본인 아이인지 검증
CREATE POLICY "growth_insert_own"
  ON public.child_growth_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "growth_update_own"
  ON public.child_growth_records FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "growth_delete_own"
  ON public.child_growth_records FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- child_feeding_records
-- ============================================================
ALTER TABLE public.child_feeding_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feeding_select_own" ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_insert_own" ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_update_own" ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_delete_own" ON public.child_feeding_records;

CREATE POLICY "feeding_select_own"
  ON public.child_feeding_records FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "feeding_insert_own"
  ON public.child_feeding_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "feeding_update_own"
  ON public.child_feeding_records FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "feeding_delete_own"
  ON public.child_feeding_records FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- child_sleep_records
-- ============================================================
ALTER TABLE public.child_sleep_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sleep_select_own" ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_insert_own" ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_update_own" ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_delete_own" ON public.child_sleep_records;

CREATE POLICY "sleep_select_own"
  ON public.child_sleep_records FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "sleep_insert_own"
  ON public.child_sleep_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "sleep_update_own"
  ON public.child_sleep_records FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sleep_delete_own"
  ON public.child_sleep_records FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- child_health_records
-- ============================================================
ALTER TABLE public.child_health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "health_select_own" ON public.child_health_records;
DROP POLICY IF EXISTS "health_insert_own" ON public.child_health_records;
DROP POLICY IF EXISTS "health_update_own" ON public.child_health_records;
DROP POLICY IF EXISTS "health_delete_own" ON public.child_health_records;

CREATE POLICY "health_select_own"
  ON public.child_health_records FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "health_insert_own"
  ON public.child_health_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "health_update_own"
  ON public.child_health_records FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "health_delete_own"
  ON public.child_health_records FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- vaccines — 공개 조회 (삭제되지 않은 데이터)
-- ============================================================
ALTER TABLE public.vaccines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vaccines_public_select" ON public.vaccines;

CREATE POLICY "vaccines_public_select"
  ON public.vaccines FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ============================================================
-- vaccine_schedules — 공개 조회
-- ============================================================
ALTER TABLE public.vaccine_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vaccine_schedules_public_select" ON public.vaccine_schedules;

CREATE POLICY "vaccine_schedules_public_select"
  ON public.vaccine_schedules FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ============================================================
-- child_vaccination_records
-- ============================================================
ALTER TABLE public.child_vaccination_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vaccination_select_own" ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_insert_own" ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_update_own" ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_delete_own" ON public.child_vaccination_records;

CREATE POLICY "vaccination_select_own"
  ON public.child_vaccination_records FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "vaccination_insert_own"
  ON public.child_vaccination_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

CREATE POLICY "vaccination_update_own"
  ON public.child_vaccination_records FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "vaccination_delete_own"
  ON public.child_vaccination_records FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- development_contents — 공개 조회
-- ============================================================
ALTER TABLE public.development_contents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "development_contents_public_select" ON public.development_contents;

CREATE POLICY "development_contents_public_select"
  ON public.development_contents FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ============================================================
-- development_checklists — 공개 조회
-- ============================================================
ALTER TABLE public.development_checklists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "development_checklists_public_select" ON public.development_checklists;

CREATE POLICY "development_checklists_public_select"
  ON public.development_checklists FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- ============================================================
-- community_posts
-- ============================================================
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_public_select"  ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_insert_auth"    ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_update_own"     ON public.community_posts;

-- active 상태이고 소프트 삭제되지 않은 게시글만 공개 조회
CREATE POLICY "community_posts_public_select"
  ON public.community_posts FOR SELECT TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

-- 작성: 로그인 사용자만. child_id는 본인 아이이거나 NULL이어야 함
CREATE POLICY "community_posts_insert_auth"
  ON public.community_posts FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      child_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.children c
        WHERE c.id = child_id
          AND c.user_id = auth.uid()
          AND c.deleted_at IS NULL
      )
    )
  );

-- 수정: 작성자만
CREATE POLICY "community_posts_update_own"
  ON public.community_posts FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- community_comments
-- ============================================================
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_comments_public_select" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_insert_auth"   ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_update_own"    ON public.community_comments;

-- active 상태 댓글만 공개 조회
CREATE POLICY "community_comments_public_select"
  ON public.community_comments FOR SELECT TO anon, authenticated
  USING (status = 'active' AND deleted_at IS NULL);

-- 작성: 로그인 사용자만
CREATE POLICY "community_comments_insert_auth"
  ON public.community_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 수정: 작성자만
CREATE POLICY "community_comments_update_own"
  ON public.community_comments FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- community_likes
-- ============================================================
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_likes_select_auth" ON public.community_likes;
DROP POLICY IF EXISTS "community_likes_insert_auth" ON public.community_likes;
DROP POLICY IF EXISTS "community_likes_delete_own"  ON public.community_likes;

-- 로그인 사용자: 소프트 삭제되지 않은 좋아요 조회
CREATE POLICY "community_likes_select_auth"
  ON public.community_likes FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- 등록: 로그인 사용자만 (unique index로 중복 방지)
CREATE POLICY "community_likes_insert_auth"
  ON public.community_likes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 삭제: 본인 좋아요만
CREATE POLICY "community_likes_delete_own"
  ON public.community_likes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- community_reports
-- ============================================================
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_reports_insert_auth" ON public.community_reports;
DROP POLICY IF EXISTS "community_reports_select_own"  ON public.community_reports;

-- 등록: 로그인 사용자만
CREATE POLICY "community_reports_insert_auth"
  ON public.community_reports FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 조회: 본인 신고 내역만 (전체 신고 목록은 관리자만 접근)
CREATE POLICY "community_reports_select_own"
  ON public.community_reports FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- notifications
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;

-- 본인 알림만 조회 (소프트 삭제 제외)
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

-- 수정: 본인 알림 상태(read_at 등) 업데이트
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT는 service role(서버)만 허용 — 정책 없음 = anon/authenticated 삽입 불가
