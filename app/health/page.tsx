import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import ChildSummaryCard from '@/components/child/ChildSummaryCard'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import HealthSummaryCard from '@/components/health/HealthSummaryCard'
import HealthRecordForm from '@/components/health/HealthRecordForm'
import HealthRecordList from '@/components/health/HealthRecordList'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '건강 기록 | BabyRoad',
}

export default async function HealthPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()
  const { data } = await supabase
    .from('child_health_records')
    .select('*')
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .order('recorded_at', { ascending: false })
    .limit(20)

  const records = (data ?? []) as Tables<'child_health_records'>[]

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="건강 기록" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">건강 기록</h1>
            <p className="babyroad-subtitle">
              체온, 증상, 병원 방문 기록을 남겨요.
            </p>
          </div>

          <ChildSummaryCard child={child} />
          <HealthSummaryCard records={records} />
          <HealthRecordForm userId={user.id} childId={child.id} />
          <HealthRecordList records={records} />

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
