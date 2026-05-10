import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import CommunityPostForm from '@/components/community/CommunityPostForm'

export const metadata: Metadata = {
  title: '글쓰기 | BabyRoad',
}

export default async function CommunityWritePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="글쓰기" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <CommunityPostForm userId={user.id} authorNickname={profile.nickname} />

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
