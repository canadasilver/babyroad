import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import CommunityPostDetail from '@/components/community/CommunityPostDetail'
import CommunityCommentList from '@/components/community/CommunityCommentList'
import CommunityCommentForm from '@/components/community/CommunityCommentForm'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '게시글 | BabyRoad',
}

export default async function CommunityPostPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params

  const [user, supabase] = await Promise.all([
    getAuthUser(),
    createClient(),
  ])

  const { data: postData } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()

  if (!postData) notFound()
  const post = postData as Tables<'community_posts'>

  const [commentsResult, likeCountResult] = await Promise.all([
    supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('community_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .is('deleted_at', null),
  ])

  const comments = (commentsResult.data ?? []) as Tables<'community_comments'>[]
  const likeCount = likeCountResult.count ?? 0

  let isLiked = false
  let userNickname: string | null = null

  if (user) {
    const [likeResult, profileResult] = await Promise.all([
      supabase
        .from('community_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', postId)
        .is('deleted_at', null)
        .maybeSingle(),
      getProfile(user.id),
    ])
    isLiked = !!likeResult.data
    userNickname = profileResult?.nickname ?? null
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="게시글" showBack />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">
          <CommunityPostDetail
            post={post}
            userId={user?.id ?? null}
            likeCount={likeCount}
            isLiked={isLiked}
          />

          <CommunityCommentList comments={comments} userId={user?.id ?? null} />

          {user && userNickname ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-700">댓글 작성</h3>
              <CommunityCommentForm
                postId={postId}
                userId={user.id}
                authorNickname={userNickname}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white py-4 text-center">
              <p className="text-sm text-slate-500">
                댓글을 남기려면{' '}
                <a href="/login" className="font-medium text-orange-600 underline">
                  로그인
                </a>
                이 필요해요.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs leading-relaxed text-amber-800">
              커뮤니티의 글과 댓글은 사용자 경험 공유를 위한 내용입니다.
              아이의 건강, 질병, 예방접종, 발달 관련 판단은 반드시 전문 의료진과 상담해 주세요.
            </p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
