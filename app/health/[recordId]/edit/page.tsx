import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import HealthEditForm from '@/components/health/HealthEditForm'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '건강 기록 수정 | BabyRoad',
}

interface PageProps {
  params: Promise<{ recordId: string }>
}

export default async function HealthEditPage({ params }: PageProps) {
  const { recordId } = await params

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const supabase = await createClient()

  const { data: recordData } = await supabase
    .from('child_health_records')
    .select('id, user_id, child_id, recorded_at, temperature, symptoms, medicine, hospital_name, memo, created_at, updated_at, deleted_at')
    .eq('id', recordId)
    .eq('user_id', user.id)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!recordData) notFound()

  const record = recordData as Tables<'child_health_records'>

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="건강 기록 수정" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-5">
          <section>
            <h1 className="babyroad-title">건강 기록 수정</h1>
            <p className="babyroad-subtitle">
              {child.name}의 건강 기록을 수정해요.
            </p>
          </section>

          <HealthEditForm record={record} />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
