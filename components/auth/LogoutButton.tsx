'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type LogoutButtonProps = {
  className?: string
  variant?: 'default' | 'danger'
}

export default function LogoutButton({ className, variant = 'default' }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    if (loading) return
    setLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const baseClass =
    'rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

  const variantClass =
    variant === 'danger'
      ? 'text-red-600 hover:bg-red-50'
      : 'text-slate-600 hover:bg-slate-100'

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={[baseClass, variantClass, className].filter(Boolean).join(' ')}
    >
      {loading ? '로그아웃 중...' : '로그아웃'}
    </button>
  )
}
