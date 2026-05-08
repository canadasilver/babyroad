import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import GrowthRecordForm from '@/components/growth/GrowthRecordForm'
import GrowthRecordList from '@/components/growth/GrowthRecordList'
import GrowthSummaryCard from '@/components/growth/GrowthSummaryCard'
import type { Child } from '@/types/child'

export const metadata: Metadata = {
  title: '성장 기록',
}

export default async function GrowthPage() {
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
  if (!child) redirect('/onboarding')

  const { data: records } = await supabase
    .from('child_growth_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('record_date', { ascending: false })
    .order('created_at', { ascending: false })

  const growthRecords = records ?? []
  const latestRecord = growthRecords[0] ?? null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header title="성장 기록" />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto w-full max-w-md space-y-5">
          <section>
            <h1 className="text-2xl font-bold text-slate-900">성장 기록</h1>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              키, 몸무게, 머리둘레를 기록하고 성장 변화를 확인해요.
            </p>
          </section>

          <GrowthSummaryCard child={child} latestRecord={latestRecord} />

          <GrowthRecordForm userId={user.id} childId={child.id} />

          <GrowthRecordList records={growthRecords} />

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
