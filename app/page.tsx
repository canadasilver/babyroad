import type { Metadata } from 'next'
import IntroScreen from '@/components/intro/IntroScreen'

export const metadata: Metadata = {
  title: 'BabyRoad | 베이비로드',
  description: '우리 아이의 성장 여정을 함께 기록하는 BabyRoad 인트로 화면',
}

export default function IntroPage() {
  return <IntroScreen />
}
