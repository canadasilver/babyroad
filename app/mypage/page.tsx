import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import LogoutButton from '@/components/auth/LogoutButton'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import type { Child } from '@/types/child'

export const metadata: Metadata = {
  title: '마이페이지 | BabyRoad',
}

export default async function MypagePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const { data: childrenData } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const children = (childrenData ?? []) as Child[]
  const child = children[0] ?? null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="마이페이지" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">마이페이지</h1>
            <p className="mt-1 text-sm text-slate-500">안녕하세요, {profile.nickname}님</p>
          </div>

          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-2xl">
                👤
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{profile.nickname}</p>
                {profile.email && (
                  <p className="mt-0.5 truncate text-sm text-slate-500">{profile.email}</p>
                )}
              </div>
            </div>
          </Card>

          {child && <ChildSummaryCard child={child} />}

          {!child && (
            <Card className="border-dashed py-6 text-center">
              <p className="text-sm text-slate-500">아직 등록된 아이 정보가 없어요.</p>
              <a
                href="/onboarding"
                className="mt-3 inline-flex rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white"
              >
                아이 정보 등록하기
              </a>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">메뉴</h3>
            <div className="space-y-1">
              <a
                href="/growth"
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">📏 성장 기록</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/vaccinations"
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">💉 예방접종</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/feeding"
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">🍼 수유/식사 기록</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/sleep"
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">🌙 수면 기록</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/health"
                className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-slate-50"
              >
                <span className="text-sm text-slate-700">🩺 건강 기록</span>
                <span className="text-slate-400">›</span>
              </a>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">계정</h3>
            <LogoutButton className="w-full justify-center rounded-xl border border-slate-300 py-3 text-center" />
          </Card>

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
