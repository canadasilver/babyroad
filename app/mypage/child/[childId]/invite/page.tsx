import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { CHILD_SELECT_COLUMNS } from '@/lib/children'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AppShell from '@/components/ui/AppShell'
import AppCard from '@/components/ui/AppCard'
import SectionHeader from '@/components/ui/SectionHeader'
import InviteCreateForm from '@/components/child/InviteCreateForm'
import type { Child } from '@/types/child'

export const metadata: Metadata = {
  title: '공동 보호자 초대 | BabyRoad',
}

interface PageProps {
  params: Promise<{ childId: string }>
}

export default async function ChildInvitePage({ params }: PageProps) {
  const { childId } = await params

  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()

  // 해당 아이가 현재 사용자 소유인지 확인
  const { data: childData } = await supabase
    .from('children')
    .select(CHILD_SELECT_COLUMNS)
    .eq('id', childId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  if (!childData) notFound()

  const child = childData as Child

  // owner 권한 확인 (child_collaborators)
  const { data: collabRaw } = await supabase
    .from('child_collaborators')
    .select('role, status')
    .eq('child_id', childId)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  const collabData = collabRaw as { role: string; status: string } | null
  const isOwner = collabData?.role === 'owner' && collabData?.status === 'active'
  if (!isOwner) {
    return (
      <div className="babyroad-page flex min-h-screen flex-col">
        <Header title="공동 보호자 초대" showBack />
        <AppShell className="flex-1" contentClassName="space-y-5" withBottomNavPadding>
          <AppCard className="py-8 text-center">
            <p className="text-sm font-semibold text-slate-700">초대 권한이 없습니다</p>
            <p className="mt-2 text-xs text-slate-500">관리자(owner)만 공동 보호자를 초대할 수 있어요.</p>
          </AppCard>
        </AppShell>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="공동 보호자 초대" showBack />

      <AppShell className="flex-1" contentClassName="space-y-5" withBottomNavPadding>
        <SectionHeader
          title="공동 보호자 초대"
          description="가족이 같은 아이의 기록을 함께 볼 수 있도록 초대 링크를 만들어 공유해 주세요."
        />

        <AppCard variant="hero" padding="lg">
          <InviteCreateForm
            userId={user.id}
            childId={child.id}
            childName={child.name}
          />
        </AppCard>
      </AppShell>

      <BottomNav />
    </div>
  )
}
