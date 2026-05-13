'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface VaccinationUndoButtonProps {
  recordId: string
  userId: string
}

export default function VaccinationUndoButton({ recordId, userId }: VaccinationUndoButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleUndo() {
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('child_vaccination_records') as any)
        .delete()
        .eq('id', recordId)

      if (error) {
        setErrorMessage('취소 처리 중 문제가 발생했습니다.')
        return
      }

      router.refresh()
    } catch {
      setErrorMessage('취소 처리 중 문제가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {errorMessage && (
        <p className="text-right text-xs text-red-500">{errorMessage}</p>
      )}
      <button
        onClick={handleUndo}
        disabled={loading}
        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:border-slate-400 hover:text-slate-700 disabled:opacity-50"
      >
        {loading ? '취소 중...' : '완료 취소'}
      </button>
    </div>
  )
}
