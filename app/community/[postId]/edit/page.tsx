import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import CommunityPostEditForm from '@/components/community/CommunityPostEditForm'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '게시글 수정 | BabyRoad',
}

interface PageProps {
  params: Promise<{ postId: string }>
}

export default async function CommunityPostEditPage({ params }: PageProps) {
  const { postId } = await params

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  const { data: postData } = await supabase
    .from('community_posts')
    .select('*')
    .eq('id', postId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!postData) notFound()

  const post = postData as Tables<'community_posts'>

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="게시글 수정" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-5">
          <section>
            <h1 className="babyroad-title">게시글 수정</h1>
            <p className="babyroad-subtitle">내용을 수정하고 저장해요.</p>
          </section>

          <CommunityPostEditForm post={post} userId={user.id} />

          <div className="rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF7DF]/78 px-4 py-3">
            <p className="text-xs leading-relaxed text-[#9A6A38]">
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
