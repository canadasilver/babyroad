'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { Tables } from '@/types/database'

const SLEEP_TYPES = [
  { value: 'night_sleep', label: '밤잠' },
  { value: 'day_sleep', label: '낮잠' },
] as const

type SleepType = 'day_sleep' | 'night_sleep'

const editSchema = z
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

function isoToDatetimeLocal(iso: string): string {
  return toLocalDateTimeString(new Date(iso))
}

interface SleepEditFormProps {
  record: Tables<'child_sleep_records'>
}

export default function SleepEditForm({ record }: SleepEditFormProps) {
  const router = useRouter()

  const [sleepStart, setSleepStart] = useState(isoToDatetimeLocal(record.sleep_start))
  const [sleepEnd, setSleepEnd] = useState(
    record.sleep_end ? isoToDatetimeLocal(record.sleep_end) : ''
  )
  const [sleepType, setSleepType] = useState<SleepType>(record.sleep_type)
  const [wakeCount, setWakeCount] = useState(String(record.wake_count))
  const [memo, setMemo] = useState(record.memo ?? '')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = editSchema.safeParse({ sleepStart, sleepEnd, sleepType, wakeCount, memo })

    if (!parsed.success) {
      const errors: Record<string, string> = {}
      parsed.error.errors.forEach((e) => {
        const key = String(e.path[0])
        if (!errors[key]) errors[key] = e.message
      })
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setIsSaving(true)
    setErrorMessage(null)

    const { data } = parsed
    const supabase = createClient()
    const { error } = await supabase
      .from('child_sleep_records')
      .update({
        sleep_start: new Date(data.sleepStart).toISOString(),
        sleep_end: new Date(data.sleepEnd).toISOString(),
        sleep_type: data.sleepType,
        wake_count: data.wakeCount ? parseInt(data.wakeCount, 10) : 0,
        memo: data.memo || null,
        updated_at: new Date().toISOString(),
      } as never)
      .eq('id', record.id)
      .eq('user_id', record.user_id)
      .eq('child_id', record.child_id)
      .is('deleted_at', null)

    if (error) {
      setErrorMessage('수정 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    router.push('/sleep')
    router.refresh()
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div
            role="alert"
            className="rounded-[1.25rem] border border-[#F6D6C4] bg-[#FFF3E9]/80 px-4 py-3 text-sm text-[#9A4E2A]"
          >
            {errorMessage}
          </div>
        )}

        <div>
          <label htmlFor="sleepType" className="block text-sm font-medium text-slate-700">
            수면 유형
          </label>
          <select
            id="sleepType"
            value={sleepType}
            onChange={(e) => setSleepType(e.target.value as SleepType)}
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

        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" size="lg" loading={isSaving} className="flex-1">
            {isSaving ? '저장 중...' : '수정 완료'}
          </Button>
        </div>
      </form>
    </Card>
  )
}
