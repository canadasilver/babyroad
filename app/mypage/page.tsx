import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'

export const metadata: Metadata = {
  title: '마이페이지 | BabyRoad',
}

export default async function MypagePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="마이페이지" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">마이페이지</h1>
            <p className="mt-1 text-sm text-slate-500">
              안녕하세요, {profile.nickname}님
            </p>
          </div>

          <Card className="py-10 text-center">
            <p className="text-4xl">👤</p>
            <p className="mt-3 text-base font-semibold text-slate-800">준비 중입니다</p>
            <p className="mt-2 text-sm text-slate-500">마이페이지 기능을 곧 제공할 예정이에요.</p>
          </Card>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
