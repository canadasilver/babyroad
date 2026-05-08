import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import HealthSummaryCard from '@/components/health/HealthSummaryCard'
import HealthRecordForm from '@/components/health/HealthRecordForm'
import HealthRecordList from '@/components/health/HealthRecordList'
import type { Child } from '@/types/child'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '건강 기록 | BabyRoad',
}

export default async function HealthPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const { data: children } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const childList = (children ?? []) as Child[]
  const child = childList[0] ?? null

  let records: Tables<'child_health_records'>[] = []

  if (child) {
    const { data } = await supabase
      .from('child_health_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('child_id', child.id)
      .is('deleted_at', null)
      .order('recorded_at', { ascending: false })
      .limit(20)

    records = (data ?? []) as Tables<'child_health_records'>[]
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="건강 기록" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">건강 기록</h1>
            <p className="mt-1 text-sm text-slate-500">
              체온, 증상, 병원 방문 기록을 남겨요.
            </p>
          </div>

          {child ? (
            <>
              <ChildSummaryCard child={child} />
              <HealthSummaryCard records={records} />
              <HealthRecordForm userId={user.id} childId={child.id} />
              <HealthRecordList records={records} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm text-slate-500">아이 정보를 먼저 등록해 주세요.</p>
            </div>
          )}

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
