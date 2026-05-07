import type { Metadata } from 'next'
import AuthConfirmClient from '@/components/auth/AuthConfirmClient'

export const metadata: Metadata = {
  title: '로그인 확인',
}

type SearchParams = Promise<{ code?: string }>

export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { code } = await searchParams

  return <AuthConfirmClient code={code ?? null} />
}
