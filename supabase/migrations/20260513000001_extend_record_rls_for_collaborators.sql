-- ============================================================
-- BabyRoad 공동 보호자 기록 권한 확장 (Phase 2)
-- 파일: supabase/migrations/20260513000001_extend_record_rls_for_collaborators.sql
--
-- 변경 내용:
--   기존 user_id 기반 정책을 child_collaborators 기반 정책으로 교체
--   owner/editor/viewer → SELECT 가능
--   owner/editor         → INSERT / UPDATE 가능
--   viewer               → 조회만 가능, 입력/수정/삭제 불가
--
-- 기존 소유자(owner) 호환:
--   child_collaborators 백필로 기존 owner row가 존재하므로
--   기존 기능은 그대로 작동함
-- ============================================================

-- ============================================================
-- 1. child_growth_records
-- ============================================================
DROP POLICY IF EXISTS "growth_select_own"          ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_insert_own"          ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_update_own"          ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_delete_own"          ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_select_collaborator" ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_insert_collaborator" ON public.child_growth_records;
DROP POLICY IF EXISTS "growth_update_collaborator" ON public.child_growth_records;

-- SELECT: active collaborator (owner/editor/viewer)
CREATE POLICY "growth_select_collaborator"
  ON public.child_growth_records FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_growth_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

-- INSERT: owner/editor만 가능, user_id = 현재 사용자
CREATE POLICY "growth_insert_collaborator"
  ON public.child_growth_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_growth_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- UPDATE: owner/editor만 가능 (soft delete 포함)
CREATE POLICY "growth_update_collaborator"
  ON public.child_growth_records FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_growth_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_growth_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- ============================================================
-- 2. child_feeding_records
-- ============================================================
DROP POLICY IF EXISTS "feeding_select_own"          ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_insert_own"          ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_update_own"          ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_delete_own"          ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_select_collaborator" ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_insert_collaborator" ON public.child_feeding_records;
DROP POLICY IF EXISTS "feeding_update_collaborator" ON public.child_feeding_records;

CREATE POLICY "feeding_select_collaborator"
  ON public.child_feeding_records FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_feeding_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

CREATE POLICY "feeding_insert_collaborator"
  ON public.child_feeding_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_feeding_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

CREATE POLICY "feeding_update_collaborator"
  ON public.child_feeding_records FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_feeding_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_feeding_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- ============================================================
-- 3. child_sleep_records
-- ============================================================
DROP POLICY IF EXISTS "sleep_select_own"          ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_insert_own"          ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_update_own"          ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_delete_own"          ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_select_collaborator" ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_insert_collaborator" ON public.child_sleep_records;
DROP POLICY IF EXISTS "sleep_update_collaborator" ON public.child_sleep_records;

CREATE POLICY "sleep_select_collaborator"
  ON public.child_sleep_records FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_sleep_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

CREATE POLICY "sleep_insert_collaborator"
  ON public.child_sleep_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_sleep_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

CREATE POLICY "sleep_update_collaborator"
  ON public.child_sleep_records FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_sleep_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_sleep_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- ============================================================
-- 4. child_health_records
-- ============================================================
DROP POLICY IF EXISTS "health_select_own"          ON public.child_health_records;
DROP POLICY IF EXISTS "health_insert_own"          ON public.child_health_records;
DROP POLICY IF EXISTS "health_update_own"          ON public.child_health_records;
DROP POLICY IF EXISTS "health_delete_own"          ON public.child_health_records;
DROP POLICY IF EXISTS "health_select_collaborator" ON public.child_health_records;
DROP POLICY IF EXISTS "health_insert_collaborator" ON public.child_health_records;
DROP POLICY IF EXISTS "health_update_collaborator" ON public.child_health_records;

CREATE POLICY "health_select_collaborator"
  ON public.child_health_records FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_health_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

CREATE POLICY "health_insert_collaborator"
  ON public.child_health_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_health_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

CREATE POLICY "health_update_collaborator"
  ON public.child_health_records FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_health_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_health_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- ============================================================
-- 5. child_vaccination_records
-- ============================================================
DROP POLICY IF EXISTS "vaccination_select_own"          ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_insert_own"          ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_update_own"          ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_delete_own"          ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_select_collaborator" ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_insert_collaborator" ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_update_collaborator" ON public.child_vaccination_records;
DROP POLICY IF EXISTS "vaccination_delete_collaborator" ON public.child_vaccination_records;

-- SELECT: owner/editor/viewer
CREATE POLICY "vaccination_select_collaborator"
  ON public.child_vaccination_records FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_vaccination_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

-- INSERT: owner/editor
CREATE POLICY "vaccination_insert_collaborator"
  ON public.child_vaccination_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_vaccination_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- UPDATE: owner/editor
CREATE POLICY "vaccination_update_collaborator"
  ON public.child_vaccination_records FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_vaccination_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_vaccination_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- DELETE (접종 완료 취소): owner/editor
CREATE POLICY "vaccination_delete_collaborator"
  ON public.child_vaccination_records FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_vaccination_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );
