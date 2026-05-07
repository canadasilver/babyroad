-- ============================================================
-- BabyRoad 초기 DB 스키마
-- 파일: supabase/migrations/202605070001_create_initial_schema.sql
--
-- 실행 순서:
--   1. 이 파일 (스키마, 인덱스, 트리거, RLS 활성화)
--   2. supabase/policies.sql  (RLS 정책)
--   3. supabase/seed.sql      (초기 데이터)
-- ============================================================

-- ----------------------------------------
-- 확장
-- ----------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------
-- updated_at 자동 갱신 함수
-- ----------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 1. profiles — 사용자 프로필
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname   text        NOT NULL,
  email      text,
  avatar_url text,
  provider   text,
  role       text        NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id),
  CONSTRAINT profiles_role_check     CHECK (role IN ('user', 'admin'))
);

-- ============================================================
-- 2. children — 아이 정보
-- ============================================================
CREATE TABLE IF NOT EXISTS public.children (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                     text        NOT NULL,
  nickname                 text,
  gender                   text        NOT NULL DEFAULT 'unknown',
  status                   text        NOT NULL DEFAULT 'born',
  due_date                 date,
  birth_date               date,
  birth_weight             numeric(5,2),
  birth_height             numeric(5,2),
  birth_head_circumference numeric(5,2),
  profile_image_url        text,
  is_premature             boolean     NOT NULL DEFAULT false,
  memo                     text,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz,
  CONSTRAINT children_gender_check CHECK (gender IN ('male', 'female', 'unknown')),
  CONSTRAINT children_status_check CHECK (status IN ('pregnancy', 'born'))
);

-- ============================================================
-- 3. child_growth_records — 성장 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_growth_records (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id           uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  record_date        date        NOT NULL,
  height             numeric(5,2),
  weight             numeric(5,2),
  head_circumference numeric(5,2),
  memo               text,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

-- ============================================================
-- 4. child_feeding_records — 수유/식사 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_feeding_records (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id     uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  feeding_type text        NOT NULL,
  amount       numeric(8,2),
  unit         text,
  food_name    text,
  reaction     text,
  memo         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz,
  CONSTRAINT feeding_type_check CHECK (
    feeding_type IN ('breast_milk', 'formula', 'baby_food', 'solid_food', 'snack', 'water')
  )
);

-- ============================================================
-- 5. child_sleep_records — 수면 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_sleep_records (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id    uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  sleep_start timestamptz NOT NULL,
  sleep_end   timestamptz,
  sleep_type  text        NOT NULL DEFAULT 'night_sleep',
  wake_count  integer     NOT NULL DEFAULT 0,
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT sleep_type_check CHECK (sleep_type IN ('day_sleep', 'night_sleep'))
);

-- ============================================================
-- 6. child_health_records — 건강 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_health_records (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id      uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  recorded_at   timestamptz NOT NULL DEFAULT now(),
  temperature   numeric(4,1),
  symptoms      text,
  medicine      text,
  hospital_name text,
  memo          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

-- ============================================================
-- 7. vaccines — 예방접종 종류 (공개 데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vaccines (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  description text,
  is_required boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- ============================================================
-- 8. vaccine_schedules — 표준 접종 일정 (공개 데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.vaccine_schedules (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  vaccine_id  uuid        NOT NULL REFERENCES public.vaccines(id) ON DELETE CASCADE,
  start_month integer     NOT NULL,
  end_month   integer     NOT NULL,
  dose_label  text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT vaccine_schedules_month_check CHECK (start_month >= 0 AND end_month >= start_month)
);

-- ============================================================
-- 9. child_vaccination_records — 아이별 예방접종 기록
-- ============================================================
CREATE TABLE IF NOT EXISTS public.child_vaccination_records (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id            uuid        NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  vaccine_id          uuid        NOT NULL REFERENCES public.vaccines(id) ON DELETE RESTRICT,
  vaccine_schedule_id uuid        REFERENCES public.vaccine_schedules(id) ON DELETE SET NULL,
  scheduled_date      date,
  vaccinated_date     date,
  status              text        NOT NULL DEFAULT 'scheduled',
  hospital_name       text,
  memo                text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz,
  CONSTRAINT vaccination_status_check CHECK (
    status IN ('scheduled', 'completed', 'delayed', 'skipped', 'consult_required')
  )
);

-- ============================================================
-- 10. development_contents — 개월별 발달 콘텐츠 (공개 데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.development_contents (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  start_month integer     NOT NULL,
  end_month   integer     NOT NULL,
  title       text        NOT NULL,
  physical    text,
  language    text,
  cognitive   text,
  social      text,
  feeding     text,
  sleep       text,
  play        text,
  caution     text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT development_contents_month_check CHECK (start_month >= 0 AND end_month >= start_month)
);

-- ============================================================
-- 11. development_checklists — 개월별 발달 체크리스트 (공개 데이터)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.development_checklists (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  start_month integer     NOT NULL,
  end_month   integer     NOT NULL,
  category    text        NOT NULL,
  title       text        NOT NULL,
  description text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CONSTRAINT development_checklists_month_check CHECK (start_month >= 0 AND end_month >= start_month)
);

-- ============================================================
-- 12. community_posts — 커뮤니티 게시글
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id      uuid        REFERENCES public.children(id) ON DELETE SET NULL,
  category      text        NOT NULL,
  title         text        NOT NULL,
  content       text        NOT NULL,
  image_url     text,
  view_count    integer     NOT NULL DEFAULT 0,
  like_count    integer     NOT NULL DEFAULT 0,
  comment_count integer     NOT NULL DEFAULT 0,
  status        text        NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  CONSTRAINT community_posts_status_check CHECK (
    status IN ('active', 'hidden', 'reported', 'deleted')
  )
);

-- ============================================================
-- 13. community_comments — 커뮤니티 댓글
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_comments (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  parent_id  uuid        REFERENCES public.community_comments(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  status     text        NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT community_comments_status_check CHECK (
    status IN ('active', 'hidden', 'reported', 'deleted')
  )
);

-- ============================================================
-- 14. community_likes — 커뮤니티 좋아요
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_likes (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- ============================================================
-- 15. community_reports — 커뮤니티 신고
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_reports (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    uuid        REFERENCES public.community_posts(id) ON DELETE SET NULL,
  comment_id uuid        REFERENCES public.community_comments(id) ON DELETE SET NULL,
  reason     text        NOT NULL,
  content    text,
  status     text        NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT community_reports_target_check CHECK (
    post_id IS NOT NULL OR comment_id IS NOT NULL
  ),
  CONSTRAINT community_reports_status_check CHECK (
    status IN ('pending', 'reviewed', 'resolved', 'dismissed')
  )
);

-- ============================================================
-- 16. notifications — 알림
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id     uuid        REFERENCES public.children(id) ON DELETE SET NULL,
  type         text        NOT NULL,
  title        text        NOT NULL,
  content      text,
  scheduled_at timestamptz,
  sent_at      timestamptz,
  read_at      timestamptz,
  status       text        NOT NULL DEFAULT 'pending',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz,
  CONSTRAINT notifications_status_check CHECK (
    status IN ('pending', 'sent', 'read', 'cancelled')
  )
);

-- ============================================================
-- 인덱스
-- ============================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
  ON public.profiles(user_id);

-- children
CREATE INDEX IF NOT EXISTS idx_children_user_id
  ON public.children(user_id);
CREATE INDEX IF NOT EXISTS idx_children_user_deleted
  ON public.children(user_id) WHERE deleted_at IS NULL;

-- child_growth_records
CREATE INDEX IF NOT EXISTS idx_growth_child_id
  ON public.child_growth_records(child_id);
CREATE INDEX IF NOT EXISTS idx_growth_child_record_date
  ON public.child_growth_records(child_id, record_date DESC);

-- child_feeding_records
CREATE INDEX IF NOT EXISTS idx_feeding_child_recorded_at
  ON public.child_feeding_records(child_id, recorded_at DESC);

-- child_sleep_records
CREATE INDEX IF NOT EXISTS idx_sleep_child_start
  ON public.child_sleep_records(child_id, sleep_start DESC);

-- child_health_records
CREATE INDEX IF NOT EXISTS idx_health_child_recorded_at
  ON public.child_health_records(child_id, recorded_at DESC);

-- vaccine_schedules
CREATE INDEX IF NOT EXISTS idx_vaccine_schedules_vaccine_id
  ON public.vaccine_schedules(vaccine_id);

-- child_vaccination_records
CREATE INDEX IF NOT EXISTS idx_vaccination_child_id
  ON public.child_vaccination_records(child_id);
CREATE INDEX IF NOT EXISTS idx_vaccination_child_scheduled
  ON public.child_vaccination_records(child_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_vaccination_status
  ON public.child_vaccination_records(status) WHERE deleted_at IS NULL;

-- development_contents
CREATE INDEX IF NOT EXISTS idx_dev_contents_month
  ON public.development_contents(start_month, end_month);

-- development_checklists
CREATE INDEX IF NOT EXISTS idx_dev_checklists_month
  ON public.development_checklists(start_month, end_month);
CREATE INDEX IF NOT EXISTS idx_dev_checklists_category
  ON public.development_checklists(category);

-- community_posts
CREATE INDEX IF NOT EXISTS idx_posts_user_id
  ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_status_created
  ON public.community_posts(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_category_created
  ON public.community_posts(category, created_at DESC) WHERE status = 'active' AND deleted_at IS NULL;

-- community_comments
CREATE INDEX IF NOT EXISTS idx_comments_post_id
  ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON public.community_comments(parent_id);

-- community_likes
CREATE INDEX IF NOT EXISTS idx_likes_post_id
  ON public.community_likes(post_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS community_likes_user_post_unique
  ON public.community_likes(user_id, post_id)
  WHERE deleted_at IS NULL;

-- community_reports
CREATE INDEX IF NOT EXISTS idx_reports_post_id
  ON public.community_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status
  ON public.community_reports(status) WHERE deleted_at IS NULL;

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_status
  ON public.notifications(user_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_at
  ON public.notifications(scheduled_at) WHERE status = 'pending';

-- ============================================================
-- updated_at 트리거
-- (community_likes는 updated_at 컬럼 없으므로 제외)
-- ============================================================

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_growth_updated_at
  BEFORE UPDATE ON public.child_growth_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_feeding_updated_at
  BEFORE UPDATE ON public.child_feeding_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_sleep_updated_at
  BEFORE UPDATE ON public.child_sleep_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_health_updated_at
  BEFORE UPDATE ON public.child_health_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_vaccines_updated_at
  BEFORE UPDATE ON public.vaccines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_vaccine_schedules_updated_at
  BEFORE UPDATE ON public.vaccine_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_vaccination_updated_at
  BEFORE UPDATE ON public.child_vaccination_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_dev_contents_updated_at
  BEFORE UPDATE ON public.development_contents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_dev_checklists_updated_at
  BEFORE UPDATE ON public.development_checklists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_comments_updated_at
  BEFORE UPDATE ON public.community_comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_reports_updated_at
  BEFORE UPDATE ON public.community_reports
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RLS 활성화
-- RLS 정책은 supabase/policies.sql에서 별도 적용
-- ============================================================
ALTER TABLE public.profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_growth_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_feeding_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_sleep_records       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_health_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_schedules         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.child_vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_contents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.development_checklists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications             ENABLE ROW LEVEL SECURITY;
