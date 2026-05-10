import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import IntroScreen from '@/components/intro/IntroScreen'
import { getAuthUser, getProfile } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'BabyRoad | 베이비로드',
  description: '우리 아이의 성장 여정을 함께 기록하는 BabyRoad 인트로 화면',
}

export default async function IntroPage() {
  const user = await getAuthUser()

  if (user) {
    const profile = await getProfile(user.id)
    redirect(profile ? '/dashboard' : '/onboarding')
  }

  return <IntroScreen />
}
