'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toISODateString } from '@/lib/date'
import Button from '@/components/common/Button'

interface VaccinationCompleteButtonProps {
  userId: string
  childId: string
  vaccineId: string
  scheduleId: string
  scheduledDate: string
}

export default function VaccinationCompleteButton({
  userId,
  childId,
  vaccineId,
  scheduleId,
  scheduledDate,
}: VaccinationCompleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleComplete() {
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const today = toISODateString()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('child_vaccination_records') as any).insert({
        user_id: userId,
        child_id: childId,
        vaccine_id: vaccineId,
        vaccine_schedule_id: scheduleId,
        scheduled_date: scheduledDate,
        vaccinated_date: today,
        status: 'completed',
      })

      if (error) {
        setErrorMessage('접종 기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      router.refresh()
    } catch {
      setErrorMessage('접종 기록 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {errorMessage && (
        <p className="text-right text-xs text-red-500">{errorMessage}</p>
      )}
      <Button variant="primary" size="sm" loading={loading} onClick={handleComplete}>
        {loading ? '저장 중...' : '접종 완료'}
      </Button>
    </div>
  )
}
