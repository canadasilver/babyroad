import { createClient } from '@/lib/supabase/server'

export type SupabaseConnectionTestResult = {
  ok: boolean
  message: string
}

function hasPublicSupabaseEnvironment() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function testSupabaseConnection(): Promise<SupabaseConnectionTestResult> {
  if (!hasPublicSupabaseEnvironment()) {
    return {
      ok: false,
      message:
        'NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.',
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return {
      ok: false,
      message: 'Supabase Auth 세션 확인 중 문제가 발생했습니다.',
    }
  }

  return {
    ok: true,
    message: data.session
      ? 'Supabase 연결과 로그인 세션 확인이 완료되었습니다.'
      : 'Supabase 연결 설정이 준비되었습니다. 현재 로그인 세션은 없습니다.',
  }
}
