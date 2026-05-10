-- ============================================================
-- community_posts, community_comments 에 author_nickname 컬럼 추가
-- 작성 시 프로필 닉네임을 비정규화하여 저장 (다른 사용자 profiles 조회 RLS 우회)
--
-- 실행 환경: Supabase SQL Editor (postgres role, RLS 우회)
-- 재실행 안전: ADD COLUMN IF NOT EXISTS 사용
-- NOT NULL 제약: MVP 안정화 후 별도 마이그레이션으로 적용 예정
-- ============================================================

-- Step 1: 컬럼 추가 (이미 있으면 무시)
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS author_nickname TEXT;

ALTER TABLE public.community_comments
  ADD COLUMN IF NOT EXISTS author_nickname TEXT;

-- Step 2: 기존 데이터 중 author_nickname이 NULL인 행을 '익명'으로 업데이트
-- SQL Editor(postgres role)에서 실행하므로 RLS 정책 우회됨
UPDATE public.community_posts
  SET author_nickname = '익명'
  WHERE author_nickname IS NULL;

UPDATE public.community_comments
  SET author_nickname = '익명'
  WHERE author_nickname IS NULL;

-- Step 3: 적용 확인용 조회 (결과에 NULL이 없어야 함)
-- SELECT id, author_nickname FROM public.community_posts ORDER BY created_at DESC LIMIT 10;
-- SELECT id, author_nickname FROM public.community_comments ORDER BY created_at DESC LIMIT 10;
