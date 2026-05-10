-- ============================================================
-- community_posts의 like_count, comment_count를 자동 동기화하는 트리거
--
-- 문제: like_count, comment_count 컬럼이 INSERT 시 0으로 고정되어
--       좋아요/댓글 추가·삭제 후에도 목록 페이지와 대시보드에 항상 0이 표시됨
--
-- 해결: community_likes / community_comments 변경 시
--       SECURITY DEFINER 함수로 RLS 우회하여 카운트 갱신
--
-- 실행 환경: Supabase SQL Editor (postgres role)
-- 재실행 안전: CREATE OR REPLACE / DROP TRIGGER IF EXISTS 사용
-- ============================================================

-- ============================================================
-- Step 1: like_count 동기화 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_post_like_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_post_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_post_id := OLD.post_id;
  ELSE
    target_post_id := NEW.post_id;
  END IF;

  UPDATE public.community_posts
  SET like_count = (
    SELECT COUNT(*)
    FROM public.community_likes
    WHERE post_id = target_post_id
      AND deleted_at IS NULL
  )
  WHERE id = target_post_id;

  RETURN NULL;
END;
$$;

-- ============================================================
-- Step 2: like_count 트리거
-- ============================================================
DROP TRIGGER IF EXISTS trg_sync_post_like_count ON public.community_likes;

CREATE TRIGGER trg_sync_post_like_count
AFTER INSERT OR DELETE ON public.community_likes
FOR EACH ROW EXECUTE FUNCTION public.sync_post_like_count();

-- ============================================================
-- Step 3: comment_count 동기화 함수
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_post_comment_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_post_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_post_id := OLD.post_id;
  ELSE
    target_post_id := NEW.post_id;
  END IF;

  UPDATE public.community_posts
  SET comment_count = (
    SELECT COUNT(*)
    FROM public.community_comments
    WHERE post_id = target_post_id
      AND status = 'active'
      AND deleted_at IS NULL
  )
  WHERE id = target_post_id;

  RETURN NULL;
END;
$$;

-- ============================================================
-- Step 4: comment_count 트리거 (INSERT + UPDATE status 변경 시)
-- ============================================================
DROP TRIGGER IF EXISTS trg_sync_post_comment_count ON public.community_comments;

CREATE TRIGGER trg_sync_post_comment_count
AFTER INSERT OR UPDATE OF status, deleted_at OR DELETE ON public.community_comments
FOR EACH ROW EXECUTE FUNCTION public.sync_post_comment_count();

-- ============================================================
-- Step 5: 기존 데이터 일괄 보정 (트리거 적용 전 게시글 대상)
-- ============================================================
UPDATE public.community_posts p
SET like_count = (
  SELECT COUNT(*)
  FROM public.community_likes l
  WHERE l.post_id = p.id
    AND l.deleted_at IS NULL
);

UPDATE public.community_posts p
SET comment_count = (
  SELECT COUNT(*)
  FROM public.community_comments c
  WHERE c.post_id = p.id
    AND c.status = 'active'
    AND c.deleted_at IS NULL
);

-- ============================================================
-- Step 6: 결과 확인 (SELECT로 확인용, 실행 후 값 확인 가능)
-- ============================================================
-- SELECT id, title, like_count, comment_count
-- FROM public.community_posts
-- WHERE status = 'active' AND deleted_at IS NULL
-- ORDER BY created_at DESC
-- LIMIT 10;
