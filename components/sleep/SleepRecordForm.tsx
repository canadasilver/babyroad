'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { TablesInsert } from '@/types/database'

const SLEEP_TYPES = [
  { value: 'night_sleep', label: '밤잠' },
  { value: 'day_sleep', label: '낮잠' },
] as const

const sleepSchema = z
  .object({
    sleepStart: z.string().min(1, '수면 시작 시간을 입력해 주세요.'),
    sleepEnd: z.string().min(1, '수면 종료 시간을 입력해 주세요.'),
    sleepType: z.enum(['day_sleep', 'night_sleep'], {
      errorMap: () => ({ message: '수면 유형을 선택해 주세요.' }),
    }),
    wakeCount: z
      .string()
      .trim()
      .refine(
        (v) =>
          v === '' ||
          (/^\d+$/.test(v) && parseInt(v, 10) >= 0 && parseInt(v, 10) <= 100),
        '깬 횟수는 0~100 사이의 정수로 입력해 주세요.'
      ),
    memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.').optional(),
  })
  .refine(
    (data) => {
      if (!data.sleepEnd || !data.sleepStart) return true
      return new Date(data.sleepEnd) > new Date(data.sleepStart)
    },
    { message: '수면 종료 시간이 시작 시간보다 빨라요.', path: ['sleepEnd'] }
  )

type SleepFormData = z.infer<typeof sleepSchema>

interface SleepRecordFormProps {
  userId: string
  childId: string
}

export default function SleepRecordForm({ userId, childId }: SleepRecordFormProps) {
  const router = useRouter()
  const defaultDateTime = useMemo(() => toLocalDateTimeString(), [])

  const [sleepStart, setSleepStart] = useState(defaultDateTime)
  const [sleepEnd, setSleepEnd] = useState(defaultDateTime)
  const [sleepType, setSleepType] = useState<SleepFormData['sleepType']>('night_sleep')
  const [wakeCount, setWakeCount] = useState('')
  const [memo, setMemo] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate(): SleepFormData | null {
    const result = sleepSchema.safeParse({ sleepStart, sleepEnd, sleepType, wakeCount, memo })

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = String(err.path[0])
        if (!errors[key]) errors[key] = err.message
      })
      setFieldErrors(errors)
      return null
    }

    setFieldErrors({})
    return result.data
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = validate()
    if (!data) return

    setIsSaving(true)
    setMessage(null)

    const payload: TablesInsert<'child_sleep_records'> = {
      user_id: userId,
      child_id: childId,
      sleep_start: new Date(data.sleepStart).toISOString(),
      sleep_end: new Date(data.sleepEnd).toISOString(),
      sleep_type: data.sleepType,
      wake_count: data.wakeCount ? parseInt(data.wakeCount, 10) : 0,
      memo: data.memo || null,
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('child_sleep_records')
      .insert([payload] as never[])

    if (error) {
      setMessage({
        type: 'error',
        text: '저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      })
      setIsSaving(false)
      return
    }

    setWakeCount('')
    setMemo('')
    setSleepStart(toLocalDateTimeString())
    setSleepEnd(toLocalDateTimeString())
    setMessage({ type: 'success', text: '수면 기록을 저장했어요.' })
    setIsSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">새 기록 추가</h2>
        <p className="mt-1 text-sm text-slate-500">수면 시작과 종료 시간을 입력해요.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {message && (
          <div
            role="status"
            className={
              message.type === 'success'
                ? 'rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700'
                : 'rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700'
            }
          >
            {message.text}
          </div>
        )}

        <div>
          <label htmlFor="sleepType" className="block text-sm font-medium text-slate-700">
            수면 유형
          </label>
          <select
            id="sleepType"
            value={sleepType}
            onChange={(e) => setSleepType(e.target.value as SleepFormData['sleepType'])}
            className="babyroad-input"
          >
            {SLEEP_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {fieldErrors.sleepType && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.sleepType}</p>
          )}
        </div>

        <div>
          <label htmlFor="sleepStart" className="block text-sm font-medium text-slate-700">
            수면 시작
          </label>
          <input
            id="sleepStart"
            type="datetime-local"
            value={sleepStart}
            onChange={(e) => setSleepStart(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.sleepStart && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.sleepStart}</p>
          )}
        </div>

        <div>
          <label htmlFor="sleepEnd" className="block text-sm font-medium text-slate-700">
            수면 종료
          </label>
          <input
            id="sleepEnd"
            type="datetime-local"
            value={sleepEnd}
            onChange={(e) => setSleepEnd(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.sleepEnd && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.sleepEnd}</p>
          )}
        </div>

        <div>
          <label htmlFor="wakeCount" className="block text-sm font-medium text-slate-700">
            중간에 깬 횟수 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="wakeCount"
            type="number"
            inputMode="numeric"
            min="0"
            max="100"
            step="1"
            placeholder="0"
            value={wakeCount}
            onChange={(e) => setWakeCount(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.wakeCount && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.wakeCount}</p>
          )}
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-slate-700">
            메모 <span className="text-slate-400">(선택)</span>
          </label>
          <textarea
            id="memo"
            rows={2}
            placeholder="특이사항을 기록해요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="babyroad-input resize-none"
          />
          {fieldErrors.memo && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.memo}</p>
          )}
        </div>

        <Button type="submit" size="lg" loading={isSaving} className="w-full">
          {isSaving ? '저장 중...' : '기록 저장'}
        </Button>
      </form>
    </Card>
  )
}
