-- ============================================================
-- BabyRoad 공동 보호자 지원 (1차)
-- 파일: supabase/migrations/20260511000002_add_child_collaboration.sql
--
-- 생성 항목:
--   1. child_collaborators — 공동 보호자 테이블
--   2. child_invites       — 초대 링크 테이블
--   3. RLS 정책 (두 테이블 + children SELECT 확장)
--   4. GRANT
--   5. 기존 children 소유자 → owner 백필
-- ============================================================

-- ============================================================
-- 1. child_collaborators
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_collaborators (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text        NOT NULL DEFAULT 'editor',
  status      text        NOT NULL DEFAULT 'active',
  invited_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT child_collaborators_role_check   CHECK (role   IN ('owner', 'editor', 'viewer')),
  CONSTRAINT child_collaborators_status_check CHECK (status IN ('pending', 'active', 'revoked')),
  CONSTRAINT child_collaborators_unique       UNIQUE (child_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_child_collaborators_child_id
  ON public.child_collaborators(child_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_child_collaborators_user_id
  ON public.child_collaborators(user_id) WHERE deleted_at IS NULL;

CREATE OR REPLACE TRIGGER set_child_collaborators_updated_at
  BEFORE UPDATE ON public.child_collaborators
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 2. child_invites
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_invites (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  invited_by   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_token text        NOT NULL UNIQUE,
  role         text        NOT NULL DEFAULT 'editor',
  status       text        NOT NULL DEFAULT 'pending',
  expires_at   timestamptz NOT NULL,
  accepted_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT child_invites_role_check   CHECK (role   IN ('editor', 'viewer')),
  CONSTRAINT child_invites_status_check CHECK (status IN ('pending', 'accepted', 'expired', 'revoked'))
);

CREATE INDEX IF NOT EXISTS idx_child_invites_token
  ON public.child_invites(invite_token);

CREATE INDEX IF NOT EXISTS idx_child_invites_child_id
  ON public.child_invites(child_id);

CREATE OR REPLACE TRIGGER set_child_invites_updated_at
  BEFORE UPDATE ON public.child_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 3. RLS 활성화
-- ============================================================
ALTER TABLE public.child_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_invites       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4-A. child_collaborators RLS 정책
-- ============================================================
DROP POLICY IF EXISTS "child_collaborators_select" ON public.child_collaborators;
DROP POLICY IF EXISTS "child_collaborators_insert" ON public.child_collaborators;
DROP POLICY IF EXISTS "child_collaborators_update" ON public.child_collaborators;

-- SELECT: 본인 row 또는 해당 아이 원래 소유자
CREATE POLICY "child_collaborators_select"
  ON public.child_collaborators FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_collaborators.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

-- INSERT: 본인 row 등록 + (아이 소유자 또는 유효한 pending invite 존재)
CREATE POLICY "child_collaborators_insert"
  ON public.child_collaborators FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM public.children c
        WHERE c.id = child_collaborators.child_id
          AND c.user_id = auth.uid()
          AND c.deleted_at IS NULL
      )
      OR EXISTS (
        SELECT 1 FROM public.child_invites ci
        WHERE ci.child_id = child_collaborators.child_id
          AND ci.role    = child_collaborators.role
          AND ci.status  = 'pending'
          AND ci.expires_at > now()
      )
    )
  );

-- UPDATE: 해당 아이 원래 소유자만 (role, status 변경)
CREATE POLICY "child_collaborators_update"
  ON public.child_collaborators FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_collaborators.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_collaborators.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

-- ============================================================
-- 4-B. child_invites RLS 정책
-- ============================================================
DROP POLICY IF EXISTS "child_invites_select" ON public.child_invites;
DROP POLICY IF EXISTS "child_invites_insert" ON public.child_invites;
DROP POLICY IF EXISTS "child_invites_update" ON public.child_invites;

-- SELECT: 아이 소유자 | 수락자 | pending 상태 (토큰 기반 접근)
CREATE POLICY "child_invites_select"
  ON public.child_invites FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_invites.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
    OR accepted_by = auth.uid()
    OR status = 'pending'
  );

-- INSERT: 아이 소유자만
CREATE POLICY "child_invites_insert"
  ON public.child_invites FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_invites.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
  );

-- UPDATE: 아이 소유자 (취소/만료) 또는 pending 초대 수락자
CREATE POLICY "child_invites_update"
  ON public.child_invites FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_invites.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
    OR (status = 'pending' AND expires_at > now())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.children c
      WHERE c.id = child_invites.child_id
        AND c.user_id = auth.uid()
        AND c.deleted_at IS NULL
    )
    OR (
      accepted_by = auth.uid()
      AND status  = 'accepted'
    )
  );

-- ============================================================
-- 4-C. children SELECT 정책 확장 — 활성 collaborator도 조회 가능
-- ============================================================
DROP POLICY IF EXISTS "children_select_collaborator" ON public.children;

CREATE POLICY "children_select_collaborator"
  ON public.children FOR SELECT TO authenticated
  USING (
    deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM public.child_collaborators cc
      WHERE cc.child_id  = children.id
        AND cc.user_id   = auth.uid()
        AND cc.status    = 'active'
        AND cc.deleted_at IS NULL
    )
  );

-- ============================================================
-- 4-D. profiles SELECT 정책 확장 — 같은 아이를 공유하는 보호자 프로필 조회
-- ============================================================
DROP POLICY IF EXISTS "profiles_select_collaborators" ON public.profiles;

CREATE POLICY "profiles_select_collaborators"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.child_collaborators cc1
      JOIN public.child_collaborators cc2 ON cc1.child_id = cc2.child_id
      WHERE cc1.user_id  = auth.uid()
        AND cc2.user_id  = profiles.user_id
        AND cc1.status   = 'active'
        AND cc2.status   = 'active'
        AND cc1.deleted_at IS NULL
        AND cc2.deleted_at IS NULL
    )
  );

-- ============================================================
-- 5. GRANT
-- ============================================================
GRANT SELECT, INSERT, UPDATE ON public.child_collaborators TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.child_invites       TO authenticated;

-- ============================================================
-- 6. 백필: 기존 children 소유자 → owner collaborator 등록
-- ============================================================
INSERT INTO public.child_collaborators (child_id, user_id, role, status, accepted_at)
SELECT id, user_id, 'owner', 'active', created_at
FROM   public.children
WHERE  deleted_at IS NULL
ON CONFLICT (child_id, user_id) DO UPDATE
  SET role       = 'owner',
      status     = 'active',
      updated_at = now();
