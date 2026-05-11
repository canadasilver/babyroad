import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AppShell from '@/components/ui/AppShell'
import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import ChildNewForm from '@/components/child/ChildNewForm'

export const metadata: Metadata = {
  title: '아이 추가 | BabyRoad',
}

export default async function ChildNewPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="아이 추가" showBack />

      <AppShell className="flex-1" contentClassName="space-y-5" withBottomNavPadding>
        <SectionHeader
          title="아이 추가하기"
          description="첫째, 둘째, 쌍둥이도 각각 따로 기록할 수 있어요."
        />

        <AppCard variant="hero" padding="lg">
          <ChildNewForm userId={user.id} />
        </AppCard>
      </AppShell>

      <BottomNav />
    </div>
  )
}
