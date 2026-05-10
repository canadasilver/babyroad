'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import type { ChildGrowthRecord } from '@/types/child'

const optionalDecimalSchema = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => !v || Number.isFinite(Number(v)), `${label}는 숫자로 입력해 주세요.`)
    .refine((v) => !v || Number(v) >= min, `${label}는 ${min} 이상으로 입력해 주세요.`)
    .refine((v) => !v || Number(v) <= max, `${label}는 ${max} 이하로 입력해 주세요.`)

const editSchema = z
  .object({
    recordDate: z.string().min(1, '기록일을 입력해 주세요.'),
    height: optionalDecimalSchema('키', 20, 250),
    weight: optionalDecimalSchema('몸무게', 0.5, 200),
    headCircumference: optionalDecimalSchema('머리둘레', 10, 80),
    memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.').optional(),
  })
  .refine((d) => d.height || d.weight || d.headCircumference, {
    message: '키, 몸무게, 머리둘레 중 하나 이상을 입력해 주세요.',
    path: ['height'],
  })

function toDisplayString(value: number | null): string {
  return value === null ? '' : String(value)
}

function parseOptional(value: string): number | null {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed) : null
}

interface GrowthEditFormProps {
  record: ChildGrowthRecord
}

export default function GrowthEditForm({ record }: GrowthEditFormProps) {
  const router = useRouter()

  const [recordDate, setRecordDate] = useState(record.record_date)
  const [height, setHeight] = useState(toDisplayString(record.height))
  const [weight, setWeight] = useState(toDisplayString(record.weight))
  const [headCircumference, setHeadCircumference] = useState(
    toDisplayString(record.head_circumference)
  )
  const [memo, setMemo] = useState(record.memo ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = editSchema.safeParse({ recordDate, height, weight, headCircumference, memo })
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {}
      parsed.error.errors.forEach((e) => {
        nextErrors[String(e.path[0])] = e.message
      })
      setFieldErrors(nextErrors)
      return
    }

    setFieldErrors({})
    setIsSaving(true)
    setErrorMessage(null)

    const { data } = parsed
    const supabase = createClient()
    const { error } = await supabase
      .from('child_growth_records')
      .update({
        record_date: data.recordDate,
        height: parseOptional(data.height ?? ''),
        weight: parseOptional(data.weight ?? ''),
        head_circumference: parseOptional(data.headCircumference ?? ''),
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

    router.push('/growth')
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
          <label htmlFor="recordDate" className="block text-sm font-medium text-slate-700">
            기록일
          </label>
          <input
            id="recordDate"
            type="date"
            value={recordDate}
            onChange={(e) => setRecordDate(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.recordDate && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.recordDate}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-slate-700">
              키 cm
            </label>
            <input
              id="height"
              type="number"
              inputMode="decimal"
              min="20"
              max="250"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 82.5"
              className="babyroad-input"
            />
            {fieldErrors.height && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.height}</p>
            )}
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-slate-700">
              몸무게 kg
            </label>
            <input
              id="weight"
              type="number"
              inputMode="decimal"
              min="0.5"
              max="200"
              step="0.01"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="예: 10.2"
              className="babyroad-input"
            />
            {fieldErrors.weight && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.weight}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="headCircumference" className="block text-sm font-medium text-slate-700">
            머리둘레 cm <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="headCircumference"
            type="number"
            inputMode="decimal"
            min="10"
            max="80"
            step="0.1"
            value={headCircumference}
            onChange={(e) => setHeadCircumference(e.target.value)}
            placeholder="예: 46.0"
            className="babyroad-input"
          />
          {fieldErrors.headCircumference && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.headCircumference}</p>
          )}
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-slate-700">
            메모 <span className="text-slate-400">(선택)</span>
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="특이사항이나 기억하고 싶은 내용을 적어 주세요."
            rows={3}
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
