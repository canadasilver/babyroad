'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { createClient } from '@/lib/supabase/client'
import { toLocalDateTimeString } from '@/lib/date'
import type { Tables } from '@/types/database'

const editSchema = z
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

function isoToDatetimeLocal(iso: string): string {
  return toLocalDateTimeString(new Date(iso))
}

interface HealthEditFormProps {
  record: Tables<'child_health_records'>
}

export default function HealthEditForm({ record }: HealthEditFormProps) {
  const router = useRouter()

  const [recordedAt, setRecordedAt] = useState(isoToDatetimeLocal(record.recorded_at))
  const [temperature, setTemperature] = useState(
    record.temperature !== null ? String(record.temperature) : ''
  )
  const [symptoms, setSymptoms] = useState(record.symptoms ?? '')
  const [medicine, setMedicine] = useState(record.medicine ?? '')
  const [hospitalName, setHospitalName] = useState(record.hospital_name ?? '')
  const [memo, setMemo] = useState(record.memo ?? '')

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const parsed = editSchema.safeParse({
      recordedAt,
      temperature,
      symptoms,
      medicine,
      hospitalName,
      memo,
    })

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
      .from('child_health_records')
      .update({
        recorded_at: new Date(data.recordedAt).toISOString(),
        temperature: data.temperature ? Number(data.temperature) : null,
        symptoms: data.symptoms || null,
        medicine: data.medicine || null,
        hospital_name: data.hospitalName || null,
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

    router.push('/health')
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
