import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AppShell from '@/components/ui/AppShell'
import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import ChildEditForm from '@/components/child/ChildEditForm'
import type { Child } from '@/types/child'

export const metadata: Metadata = {
  title: '아이 정보 수정 | BabyRoad',
}

export default async function ChildEditPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const { data: childrenData } = await supabase
    .from('children')
    .select(
      'id, user_id, name, nickname, gender, status, due_date, birth_date, birth_weight, birth_height, birth_head_circumference, profile_image_url, is_premature, memo, created_at, updated_at, deleted_at'
    )
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(1)

  const child = ((childrenData ?? [])[0] ?? null) as Child | null
  if (!child) redirect('/onboarding')

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="아이 정보 수정" showBack />

      <AppShell className="flex-1" contentClassName="space-y-5" withBottomNavPadding>
        <SectionHeader
          title="아이 정보 수정"
          description="이름, 성별, 생년월일을 정확하게 관리해 성장 리포트를 더 자연스럽게 확인해요."
        />

        <AppCard variant="hero" padding="lg">
          <div className="mb-5 rounded-[1.25rem] border border-white/70 bg-white/58 px-4 py-3">
            <p className="text-xs font-semibold text-[#4FA99A]">현재 등록된 아이</p>
            <p className="mt-1 text-lg font-black text-[#25344A]">{child.name}</p>
          </div>

          <ChildEditForm userId={user.id} child={child} />
        </AppCard>
      </AppShell>

      <BottomNav />
    </div>
  )
}
