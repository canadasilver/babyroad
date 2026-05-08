import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import CommunityPostList from '@/components/community/CommunityPostList'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '커뮤니티 | BabyRoad',
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const selectedCategory = params.category || '전체'

  const [user, supabase] = await Promise.all([
    getAuthUser(),
    createClient(),
  ])

  let query = supabase
    .from('community_posts')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(30)

  if (selectedCategory !== '전체') {
    query = query.eq('category', selectedCategory)
  }

  const { data } = await query
  const posts = (data ?? []) as Tables<'community_posts'>[]

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="커뮤니티" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md">
          <CommunityPostList
            posts={posts}
            selectedCategory={selectedCategory}
            isLoggedIn={!!user}
          />

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
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
