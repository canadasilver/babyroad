'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { TablesInsert } from '@/types/database'

const healthSchema = z
  .object({
    recordedAt: z.string().min(1, '기록 일시를 입력해 주세요.'),
    temperature: z
      .string()
      .trim()
      .refine(
        (v) =>
          v === '' ||
          (Number.isFinite(Number(v)) && Number(v) >= 34 && Number(v) <= 42),
        '체온은 34.0~42.0℃ 범위로 입력해 주세요.'
      ),
    symptoms: z.string().trim().max(200, '증상은 200자 이내로 입력해 주세요.'),
    medicine: z.string().trim().max(200, '약 복용은 200자 이내로 입력해 주세요.'),
    hospitalName: z.string().trim().max(100, '병원명은 100자 이내로 입력해 주세요.'),
    memo: z.string().trim().max(300, '메모는 300자 이내로 입력해 주세요.'),
  })
  .refine(
    (data) =>
      !!(data.symptoms.trim() || data.medicine.trim() || data.hospitalName.trim()),
    {
      message: '증상, 약 복용, 병원명 중 하나 이상을 입력해 주세요.',
      path: ['_form'],
    }
  )

type HealthFormData = z.infer<typeof healthSchema>

interface HealthRecordFormProps {
  userId: string
  childId: string
}

export default function HealthRecordForm({ userId, childId }: HealthRecordFormProps) {
  const router = useRouter()
  const defaultDateTime = useMemo(() => toLocalDateTimeString(), [])

  const [recordedAt, setRecordedAt] = useState(defaultDateTime)
  const [temperature, setTemperature] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [medicine, setMedicine] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [memo, setMemo] = useState('')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate(): HealthFormData | null {
    const result = healthSchema.safeParse({
      recordedAt,
      temperature,
      symptoms,
      medicine,
      hospitalName,
      memo,
    })

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

    const payload: TablesInsert<'child_health_records'> = {
      user_id: userId,
      child_id: childId,
      recorded_at: new Date(data.recordedAt).toISOString(),
      temperature: data.temperature ? Number(data.temperature) : null,
      symptoms: data.symptoms || null,
      medicine: data.medicine || null,
      hospital_name: data.hospitalName || null,
      memo: data.memo || null,
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('child_health_records')
      .insert([payload] as never[])

    if (error) {
      setMessage({
        type: 'error',
        text: '저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
      })
      setIsSaving(false)
      return
    }

    setTemperature('')
    setSymptoms('')
    setMedicine('')
    setHospitalName('')
    setMemo('')
    setRecordedAt(toLocalDateTimeString())
    setMessage({ type: 'success', text: '건강 기록을 저장했어요.' })
    setIsSaving(false)
    router.refresh()
  }

  return (
    <Card>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">새 기록 추가</h2>
        <p className="mt-1 text-sm text-slate-500">
          체온, 증상, 약 복용, 병원 방문 내용을 기록해요.
        </p>
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

        {fieldErrors._form && (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {fieldErrors._form}
          </div>
        )}

        <div>
          <label htmlFor="recordedAt" className="block text-sm font-medium text-slate-700">
            기록 일시
          </label>
          <input
            id="recordedAt"
            type="datetime-local"
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.recordedAt && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.recordedAt}</p>
          )}
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-slate-700">
            체온 ℃ <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="temperature"
            type="number"
            inputMode="decimal"
            min="34"
            max="42"
            step="0.1"
            placeholder="예: 37.5"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.temperature && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.temperature}</p>
          )}
        </div>

        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700">
            증상 <span className="text-slate-400">(하나 이상 필수)</span>
          </label>
          <input
            id="symptoms"
            type="text"
            placeholder="예: 기침, 콧물, 발열"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.symptoms && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.symptoms}</p>
          )}
        </div>

        <div>
          <label htmlFor="medicine" className="block text-sm font-medium text-slate-700">
            약 복용 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="medicine"
            type="text"
            placeholder="예: 타이레놀 1/2정"
            value={medicine}
            onChange={(e) => setMedicine(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.medicine && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.medicine}</p>
          )}
        </div>

        <div>
          <label htmlFor="hospitalName" className="block text-sm font-medium text-slate-700">
            병원명 <span className="text-slate-400">(선택)</span>
          </label>
          <input
            id="hospitalName"
            type="text"
            placeholder="예: 서울소아과"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="babyroad-input"
          />
          {fieldErrors.hospitalName && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.hospitalName}</p>
          )}
        </div>

        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-slate-700">
            메모 <span className="text-slate-400">(선택)</span>
          </label>
          <textarea
            id="memo"
            rows={2}
            placeholder="추가 메모를 남겨요."
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
