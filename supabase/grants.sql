-- ============================================================
-- BabyRoad GRANT 권한
-- 파일: supabase/grants.sql
--
-- 실행 순서:
--   1. supabase/migrations/202605070001_create_initial_schema.sql
--   2. supabase/policies.sql
--   3. supabase/grants.sql   ← 이 파일
--   4. supabase/seed.sql
--
-- 목적:
--   SQL 마이그레이션으로 생성한 테이블은 anon / authenticated role에
--   PostgreSQL 레벨 GRANT가 자동 부여되지 않는다.
--   RLS 정책이 존재해도 GRANT가 없으면 permission denied 오류가 발생한다.
--   이 파일은 role별 테이블 접근 권한을 명시적으로 부여한다.
-- ============================================================

-- ----------------------------------------
-- 스키마 사용 권한
-- ----------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ============================================================
-- 공개 조회 테이블 — anon + authenticated
-- (RLS 정책: deleted_at IS NULL 필터링)
-- ============================================================

GRANT SELECT ON public.vaccines                TO anon, authenticated;
GRANT SELECT ON public.vaccine_schedules       TO anon, authenticated;
GRANT SELECT ON public.development_contents    TO anon, authenticated;
GRANT SELECT ON public.development_checklists  TO anon, authenticated;

-- ============================================================
-- 사용자 소유 테이블 — authenticated 전용
-- (RLS 정책이 row 단위로 user_id = auth.uid() 제어)
-- ============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles                  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.children                  TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_growth_records      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_feeding_records     TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_sleep_records       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_health_records      TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.child_vaccination_records TO authenticated;

-- ============================================================
-- 커뮤니티 테이블
-- ============================================================

-- 게시글 / 댓글: 비로그인도 공개 조회 가능 (active 상태만 — RLS 제어)
GRANT SELECT ON public.community_posts    TO anon, authenticated;
GRANT SELECT ON public.community_comments TO anon, authenticated;

-- 게시글 / 댓글 CUD: 로그인 사용자만
GRANT INSERT, UPDATE, DELETE ON public.community_posts    TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.community_comments TO authenticated;

-- 좋아요: 로그인 사용자만 CRUD
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_likes TO authenticated;

-- 신고: 로그인 사용자만 등록 + 본인 신고 조회 (RLS 제어)
GRANT SELECT, INSERT ON public.community_reports TO authenticated;

-- ============================================================
-- 알림 테이블
-- (INSERT는 service role 전용 — 정책 없으므로 authenticated 삽입 불가)
-- ============================================================

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
