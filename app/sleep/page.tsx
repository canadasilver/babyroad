import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import SleepSummaryCard from '@/components/sleep/SleepSummaryCard'
import SleepRecordForm from '@/components/sleep/SleepRecordForm'
import SleepRecordList from '@/components/sleep/SleepRecordList'
import type { Child } from '@/types/child'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '수면 기록 | BabyRoad',
}

export default async function SleepPage() {
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

  if (!child) redirect('/onboarding')

  const { data: recordsData } = await supabase
    .from('child_sleep_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('sleep_start', { ascending: false })
    .limit(20)

  const records = (recordsData ?? []) as Tables<'child_sleep_records'>[]

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="수면 기록" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">수면 기록</h1>
            <p className="babyroad-subtitle">
              낮잠과 밤잠을 기록하고 아이의 수면 패턴을 확인해요.
            </p>
          </div>

          <ChildSummaryCard child={child} />
          <SleepSummaryCard records={records} />
          <SleepRecordForm userId={user.id} childId={child.id} />
          <SleepRecordList records={records} />
          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
