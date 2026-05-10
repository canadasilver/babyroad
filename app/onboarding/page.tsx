import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import OnboardingForm from '@/components/auth/OnboardingForm'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import BabyRoadLogo from '@/components/brand/BabyRoadLogo'
import AppShell from '@/components/ui/AppShell'

export const metadata: Metadata = {
  title: '시작하기',
}

export default async function OnboardingPage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (profile) redirect('/dashboard')

  const provider = (user.app_metadata?.provider as string) ?? 'google'
  const email = user.email ?? null
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <AppShell contentClassName="max-w-sm py-8">
        <div className="mb-8 text-center">
          <BabyRoadLogo size="sm" showText={false} align="center" />
          <h1 className="mt-3 text-2xl font-black text-[#25344A]">베이비로드 시작하기</h1>
          <p className="mt-1 text-sm text-[#6B7A90]">기본 정보를 입력해 주세요</p>
        </div>

        <OnboardingForm
          userId={user.id}
          email={email}
          avatarUrl={avatarUrl}
          provider={provider}
        />

        <div className="mt-8">
          <MedicalDisclaimer />
        </div>
    </AppShell>
  )
}
