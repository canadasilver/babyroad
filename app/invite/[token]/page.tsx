import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import AppShell from '@/components/ui/AppShell'
import AppCard from '@/components/ui/AppCard'
import InviteAcceptForm from '@/components/invite/InviteAcceptForm'
import type { InviteRole, InviteStatus } from '@/types/child'

export const metadata: Metadata = {
  title: '공동 보호자 초대 수락 | BabyRoad',
}

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params

  const user = await getAuthUser()

  // 로그인 안 된 경우: 로그인 페이지로 이동 (수락 후 재방문 필요)
  if (!user) {
    redirect('/login')
  }

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()

  // 초대 조회 (pending 상태의 초대만 접근 가능 — RLS에 의해 보장됨)
  const { data: inviteData } = await supabase
    .from('child_invites')
    .select('id, child_id, invited_by, role, status, expires_at')
    .eq('invite_token', token)
    .maybeSingle()

  // 초대가 없는 경우
  if (!inviteData) {
    return (
      <div className="babyroad-page flex min-h-screen flex-col">
        <Header title="초대 수락" showBack />
        <AppShell className="flex-1" centered contentClassName="max-w-sm">
          <AppCard className="py-10 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-4 text-base font-semibold text-slate-800">초대를 찾을 수 없어요</p>
            <p className="mt-2 text-sm text-slate-500">
              링크가 올바른지 확인하거나, 초대를 보낸 분께 다시 요청해 주세요.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-2xl bg-[#4FA99A] px-6 py-2.5 text-sm font-semibold text-white"
            >
              홈으로
            </Link>
          </AppCard>
        </AppShell>
      </div>
    )
  }

  const invite = inviteData as {
    id: string
    child_id: string
    invited_by: string
    role: InviteRole
    status: InviteStatus
    expires_at: string
  }

  // 만료된 초대
  if (invite.status !== 'pending' || new Date(invite.expires_at) <= new Date()) {
    const reason =
      invite.status === 'accepted' ? '이미 수락된 초대예요.' :
      invite.status === 'revoked'  ? '취소된 초대예요.' :
      invite.status === 'expired'  ? '만료된 초대예요.' :
      '유효하지 않은 초대예요.'

    return (
      <div className="babyroad-page flex min-h-screen flex-col">
        <Header title="초대 수락" showBack />
        <AppShell className="flex-1" centered contentClassName="max-w-sm">
          <AppCard className="py-10 text-center">
            <p className="text-4xl">⌛</p>
            <p className="mt-4 text-base font-semibold text-slate-800">{reason}</p>
            <p className="mt-2 text-sm text-slate-500">초대를 보낸 분께 새 링크를 요청해 주세요.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-2xl bg-[#4FA99A] px-6 py-2.5 text-sm font-semibold text-white"
            >
              홈으로
            </Link>
          </AppCard>
        </AppShell>
      </div>
    )
  }

  // 이미 collaborator인 경우 확인
  const { data: existingCollabRaw } = await supabase
    .from('child_collaborators')
    .select('role, status')
    .eq('child_id', invite.child_id)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .maybeSingle()

  const existingCollab = existingCollabRaw as { role: string; status: string } | null
  if (existingCollab?.status === 'active') {
    return (
      <div className="babyroad-page flex min-h-screen flex-col">
        <Header title="초대 수락" showBack />
        <AppShell className="flex-1" centered contentClassName="max-w-sm">
          <AppCard className="py-10 text-center">
            <p className="text-4xl">✅</p>
            <p className="mt-4 text-base font-semibold text-slate-800">이미 공동 보호자예요</p>
            <p className="mt-2 text-sm text-slate-500">이 아이의 기록을 이미 함께 보고 있어요.</p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-2xl bg-[#4FA99A] px-6 py-2.5 text-sm font-semibold text-white"
            >
              대시보드로
            </Link>
          </AppCard>
        </AppShell>
      </div>
    )
  }

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="공동 보호자 초대" showBack />

      <AppShell className="flex-1" centered contentClassName="max-w-sm">
        <div className="space-y-5">
          <div className="text-center">
            <p className="text-4xl">👨‍👩‍👧</p>
            <h1 className="mt-4 text-xl font-black text-[#25344A]">공동 보호자 초대를 받으셨습니다</h1>
            <p className="mt-2 text-sm text-[#6B7A90]">
              수락하면 아이의 기록을 함께 볼 수 있어요.
            </p>
          </div>

          <AppCard variant="hero" padding="lg">
            <InviteAcceptForm
              invite={{
                id:         invite.id,
                child_id:   invite.child_id,
                invited_by: invite.invited_by,
                role:       invite.role,
                expires_at: invite.expires_at,
              }}
              userId={user.id}
            />
          </AppCard>
        </div>
      </AppShell>
    </div>
  )
}
