import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildForUser } from '@/lib/children'
import { getChildRole, canEditRecords } from '@/lib/collaborator'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import DiaperEditForm from '@/components/diaper/DiaperEditForm'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '배변 기록 수정 | BabyRoad',
}

interface PageProps {
  params: Promise<{ recordId: string }>
}

export default async function DiaperEditPage({ params }: PageProps) {
  const { recordId } = await params

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const child = await getActiveChildForUser(user.id, profile)
  if (!child) redirect('/onboarding')

  const role = await getChildRole(user.id, child.id)
  if (!canEditRecords(role)) notFound()

  const supabase = await createClient()

  const { data: recordData } = await supabase
    .from('child_diaper_records')
    .select('id, user_id, child_id, recorded_at, diaper_type, stool_color, stool_texture, amount, memo, created_at, updated_at, deleted_at')
    .eq('id', recordId)
    .eq('child_id', child.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!recordData) notFound()

  const record = recordData as Tables<'child_diaper_records'>

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="배변 기록 수정" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-5">
          <section>
            <h1 className="babyroad-title">배변 기록 수정</h1>
            <p className="babyroad-subtitle">
              {child.name}의 배변 기록을 수정해요.
            </p>
          </section>

          <DiaperEditForm record={record} />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
