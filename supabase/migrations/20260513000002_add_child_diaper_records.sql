-- ============================================================
-- BabyRoad 배변 기록 테이블 추가
-- 파일: supabase/migrations/20260513000002_add_child_diaper_records.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.child_diaper_records (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id      uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_at   timestamptz NOT NULL,
  diaper_type   text        NOT NULL,
  stool_color   text        NULL,
  stool_texture text        NULL,
  amount        text        NULL,
  memo          text        NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz NULL,

  CONSTRAINT chk_diaper_type
    CHECK (diaper_type IN ('urine', 'stool', 'both')),
  CONSTRAINT chk_stool_color
    CHECK (stool_color IS NULL OR stool_color IN ('yellow','brown','green','dark','red','white','other')),
  CONSTRAINT chk_stool_texture
    CHECK (stool_texture IS NULL OR stool_texture IN ('watery','soft','normal','hard','mucus','other')),
  CONSTRAINT chk_diaper_amount
    CHECK (amount IS NULL OR amount IN ('small','normal','large'))
);

CREATE INDEX IF NOT EXISTS idx_child_diaper_records_child_id
  ON public.child_diaper_records (child_id, recorded_at DESC);

ALTER TABLE public.child_diaper_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.child_diaper_records TO authenticated;

-- SELECT: owner/editor/viewer 모두 조회 가능
CREATE POLICY "diaper_select_collaborator"
  ON public.child_diaper_records FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_diaper_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

-- INSERT: owner/editor만 가능
CREATE POLICY "diaper_insert_collaborator"
  ON public.child_diaper_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_diaper_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );

-- UPDATE: owner/editor만 가능 (soft delete 포함)
CREATE POLICY "diaper_update_collaborator"
  ON public.child_diaper_records FOR UPDATE TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_diaper_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = child_diaper_records.child_id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.role      IN ('owner', 'editor')
        AND cc.deleted_at IS NULL
    )
  );
