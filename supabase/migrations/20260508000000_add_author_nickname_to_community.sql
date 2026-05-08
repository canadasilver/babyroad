-- ============================================================
-- community_posts, community_comments 에 author_nickname 컬럼 추가
-- 작성 시 프로필 닉네임을 비정규화하여 저장 (다른 사용자 profiles 조회 RLS 우회)
-- ============================================================

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS author_nickname TEXT;

ALTER TABLE public.community_comments
  ADD COLUMN IF NOT EXISTS author_nickname TEXT;
