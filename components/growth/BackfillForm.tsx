'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AppCard from '@/components/ui/AppCard'
import AppButton from '@/components/ui/AppButton'
import { createClient } from '@/lib/supabase/client'
import { formatDateShort } from '@/lib/date'
import type { TablesInsert } from '@/types/database'

export type BackfillSectionConfig = {
  key: string
  label: string
  initialDate: string
}

type SectionData = {
  recordDate: string
  height: string
  weight: string
  headCircumference: string
  memo: string
}

type SectionErrors = Partial<Record<keyof SectionData, string>>

interface BackfillFormProps {
  userId: string
  childId: string
  sections: BackfillSectionConfig[]
}

function validateMeasurement(
  value: string,
  label: string,
  min: number,
  max: number
): string | null {
  if (!value.trim()) return null
  const num = Number(value)
  if (!Number.isFinite(num)) return `${label}는 숫자로 입력해 주세요.`
  if (num < min) return `${label}는 ${min} 이상이어야 해요.`
  if (num > max) return `${label}는 ${max} 이하이어야 해요.`
  return null
}

export default function BackfillForm({ userId, childId, sections }: BackfillFormProps) {
  const router = useRouter()

  const [sectionData, setSectionData] = useState<SectionData[]>(
    sections.map((s) => ({
      recordDate: s.initialDate,
      height: '',
      weight: '',
      headCircumference: '',
      memo: '',
    }))
  )
  const [sectionErrors, setSectionErrors] = useState<SectionErrors[]>(
    sections.map(() => ({}))
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [duplicateWarningShown, setDuplicateWarningShown] = useState(false)

  function updateField(idx: number, field: keyof SectionData, value: string) {
    setSectionData((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    )
    if (field === 'recordDate') setDuplicateWarningShown(false)
  }

  async function handleSubmit() {
    setMessage(null)
    setIsError(false)

    const newErrors: SectionErrors[] = sections.map(() => ({}))
    let hasValidationError = false
    const payloads: TablesInsert<'child_growth_records'>[] = []

    for (let i = 0; i < sections.length; i++) {
      const s = sectionData[i]
      const hasAny = s.height.trim() || s.weight.trim() || s.headCircumference.trim()
      if (!hasAny) continue

      const err: SectionErrors = {}

      if (!s.recordDate) {
        err.recordDate = '기록일을 입력해 주세요.'
        hasValidationError = true
      }

      const hErr = validateMeasurement(s.height, '키', 20, 250)
      if (hErr) { err.height = hErr; hasValidationError = true }

      const wErr = validateMeasurement(s.weight, '몸무게', 0.5, 200)
      if (wErr) { err.weight = wErr; hasValidationError = true }

      const hcErr = validateMeasurement(s.headCircumference, '머리둘레', 10, 80)
      if (hcErr) { err.headCircumference = hcErr; hasValidationError = true }

      if (s.memo.length > 300) {
        err.memo = '메모는 300자 이내로 입력해 주세요.'
        hasValidationError = true
      }

      newErrors[i] = err

      if (Object.keys(err).length === 0) {
        payloads.push({
          user_id: userId,
          child_id: childId,
          record_date: s.recordDate,
          height: s.height.trim() ? Number(s.height) : null,
          weight: s.weight.trim() ? Number(s.weight) : null,
          head_circumference: s.headCircumference.trim() ? Number(s.headCircumference) : null,
          memo: s.memo.trim() || null,
        })
      }
    }

    setSectionErrors(newErrors)
    if (hasValidationError) return

    if (payloads.length === 0) {
      setMessage('입력된 기록이 없어요. 최소 하나의 섹션에 키, 몸무게, 머리둘레 중 하나를 입력해 주세요.')
      setIsError(true)
      return
    }

    const supabase = createClient()

    // 중복 날짜 경고 (경고를 이미 확인한 경우 스킵)
    if (!duplicateWarningShown) {
      const dates = payloads.map((p) => p.record_date).filter(Boolean) as string[]
      const { data: existingRaw } = await supabase
        .from('child_growth_records')
        .select('record_date')
        .eq('child_id', childId)
        .is('deleted_at', null)
        .in('record_date', dates)

      const existing = (existingRaw ?? []) as { record_date: string }[]

      if (existing.length > 0) {
        const dupLabels = existing
          .map((r) => formatDateShort(r.record_date))
          .join(', ')
        setMessage(
          `${dupLabels} 날짜에 이미 기록이 있어요. 그래도 저장하려면 저장 버튼을 한 번 더 눌러 주세요.`
        )
        setIsError(false)
        setDuplicateWarningShown(true)
        return
      }
    }

    setIsSaving(true)
    const { error } = await supabase
      .from('child_growth_records')
      .insert(payloads as never[])

    if (error) {
      setMessage('저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsError(true)
      setIsSaving(false)
      return
    }

    router.push('/mypage/growth-report')
  }

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-[1.25rem] border px-4 py-3 text-sm ${
            isError
              ? 'border-red-200 bg-red-50 text-red-600'
              : 'border-[#CFE3D8] bg-[#EAF6F2]/82 text-[#2F766E]'
          }`}
        >
          {message}
        </div>
      )}

      {sections.map((section, i) => {
        const data = sectionData[i]
        const errors = sectionErrors[i]
        const hasAny = data.height.trim() || data.weight.trim() || data.headCircumference.trim()

        return (
          <AppCard key={section.key} variant={hasAny ? 'default' : 'soft'}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="shrink-0 rounded-full bg-[#EAF6F2] px-3 py-1 text-xs font-semibold text-[#2F8F84]">
                {section.label}
              </span>
              <div className="flex flex-col items-end gap-1">
                <input
                  type="date"
                  value={data.recordDate}
                  onChange={(e) => updateField(i, 'recordDate', e.target.value)}
                  className="min-w-[136px] rounded-xl border border-[#D9E6DF] bg-white/80 px-3 py-2 text-sm outline-none focus:border-[#4FA99A] focus:ring-2 focus:ring-[#4FA99A]/20"
                />
                {errors.recordDate && (
                  <p className="text-xs text-red-500">{errors.recordDate}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#25344A]">
                  키 <span className="text-xs font-normal text-[#9AA8BA]">cm</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="20"
                  max="250"
                  step="0.1"
                  value={data.height}
                  onChange={(e) => updateField(i, 'height', e.target.value)}
                  placeholder="예: 82.5"
                  className="babyroad-input"
                />
                {errors.height && (
                  <p className="mt-1 text-xs text-red-500">{errors.height}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#25344A]">
                  몸무게 <span className="text-xs font-normal text-[#9AA8BA]">kg</span>
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.5"
                  max="200"
                  step="0.01"
                  value={data.weight}
                  onChange={(e) => updateField(i, 'weight', e.target.value)}
                  placeholder="예: 10.2"
                  className="babyroad-input"
                />
                {errors.weight && (
                  <p className="mt-1 text-xs text-red-500">{errors.weight}</p>
                )}
              </div>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-[#25344A]">
                머리둘레{' '}
                <span className="text-xs font-normal text-[#9AA8BA]">cm · 선택</span>
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="10"
                max="80"
                step="0.1"
                value={data.headCircumference}
                onChange={(e) => updateField(i, 'headCircumference', e.target.value)}
                placeholder="예: 46.0"
                className="babyroad-input"
              />
              {errors.headCircumference && (
                <p className="mt-1 text-xs text-red-500">{errors.headCircumference}</p>
              )}
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-sm font-medium text-[#25344A]">
                메모 <span className="text-xs font-normal text-[#9AA8BA]">선택</span>
              </label>
              <textarea
                value={data.memo}
                onChange={(e) => updateField(i, 'memo', e.target.value)}
                placeholder="기억해두고 싶은 내용을 적어 주세요."
                rows={2}
                className="babyroad-input resize-none"
              />
              {errors.memo && (
                <p className="mt-1 text-xs text-red-500">{errors.memo}</p>
              )}
            </div>
          </AppCard>
        )
      })}

      <AppButton
        variant="primary"
        size="lg"
        loading={isSaving}
        onClick={handleSubmit}
        className="w-full"
      >
        {isSaving ? '저장 중...' : '기록 저장하고 그래프 보기'}
      </AppButton>

      <p className="pb-2 text-center text-xs text-[#9AA8BA]">
        값을 입력하지 않은 섹션은 저장되지 않아요.
      </p>
    </div>
  )
}
