'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import AppButton from '@/components/ui/AppButton'
import { createClient } from '@/lib/supabase/client'
import type { TablesUpdate } from '@/types/database'
import type { Child, ChildGender } from '@/types/child'

const GENDER_OPTIONS: Array<{ value: ChildGender; label: string }> = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
  { value: 'unknown', label: '아직 모르겠어요' },
]

const childEditSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, '아이 이름을 입력해 주세요.')
      .max(30, '아이 이름은 30자 이내로 입력해 주세요.'),
    gender: z.enum(['male', 'female', 'unknown']),
    birthDate: z.string().optional(),
    status: z.enum(['pregnancy', 'born']),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'born' && !data.birthDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '생년월일을 입력해 주세요.',
        path: ['birthDate'],
      })
      return
    }

    if (!data.birthDate) return

    const selectedDate = new Date(`${data.birthDate}T00:00:00`)
    if (Number.isNaN(selectedDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '올바른 생년월일을 입력해 주세요.',
        path: ['birthDate'],
      })
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate > today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '생년월일은 오늘 이후 날짜로 입력할 수 없어요.',
        path: ['birthDate'],
      })
    }
  })

type ChildEditFormProps = {
  child: Child
  userId: string
}

type FieldErrors = Partial<Record<'birthDate' | 'gender' | 'name', string>>

export default function ChildEditForm({ child, userId }: ChildEditFormProps) {
  const router = useRouter()
  const [name, setName] = useState(child.name)
  const [gender, setGender] = useState<ChildGender>(child.gender)
  const [birthDate, setBirthDate] = useState(child.birth_date ?? '')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate() {
    const result = childEditSchema.safeParse({
      name,
      gender,
      birthDate: birthDate || undefined,
      status: child.status,
    })

    if (result.success) {
      setFieldErrors({})
      return result.data
    }

    const nextErrors: FieldErrors = {}
    result.error.errors.forEach((error) => {
      const field = error.path[0]
      if (field === 'name' || field === 'gender' || field === 'birthDate') {
        nextErrors[field] = error.message
      }
    })
    setFieldErrors(nextErrors)
    return null
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = validate()
    if (!data) return

    setIsSaving(true)
    setMessage(null)

    const supabase = createClient()
    const payload: TablesUpdate<'children'> = {
      name: data.name,
      gender: data.gender,
      birth_date: data.birthDate ?? null,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('children')
      .update(payload as never)
      .eq('id', child.id)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (error) {
      setMessage('아이 정보 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    setMessage('저장되었습니다. 마이페이지로 이동합니다.')
    router.refresh()
    router.replace('/mypage')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message ? (
        <div
          role="status"
          className="rounded-[1.25rem] border border-[#CFE3D8] bg-[#EAF6F2]/72 px-4 py-3 text-sm font-medium text-[#2F766E]"
        >
          {message}
        </div>
      ) : null}

      <div>
        <label htmlFor="child-name" className="block text-sm font-bold text-[#25344A]">
          아이 이름
        </label>
        <input
          id="child-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="babyroad-input min-h-12"
          placeholder="아이 이름을 입력해 주세요"
          maxLength={30}
        />
        {fieldErrors.name ? (
          <p className="mt-2 text-xs font-medium text-[#C45B50]">{fieldErrors.name}</p>
        ) : null}
      </div>

      <div>
        <span className="block text-sm font-bold text-[#25344A]">성별</span>
        <div className="mt-2 grid grid-cols-1 gap-2 min-[380px]:grid-cols-3">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className={`min-h-12 rounded-2xl border px-3 text-sm font-bold transition-colors ${
                gender === option.value
                  ? 'border-[#4FA99A] bg-[#EAF6F2] text-[#2F766E] shadow-[0_8px_18px_rgba(79,169,154,0.12)]'
                  : 'border-[#D9E6DF] bg-white/78 text-[#6B7A90] hover:border-[#CFE3D8]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {fieldErrors.gender ? (
          <p className="mt-2 text-xs font-medium text-[#C45B50]">{fieldErrors.gender}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="birth-date" className="block text-sm font-bold text-[#25344A]">
          생년월일
        </label>
        <input
          id="birth-date"
          type="date"
          value={birthDate}
          onChange={(event) => setBirthDate(event.target.value)}
          className="babyroad-input min-h-12"
        />
        <p className="mt-2 rounded-2xl border border-[#F6D7C8] bg-[#FFF3E9]/72 px-3 py-2 text-xs leading-5 text-[#B86C4E]">
          생년월일을 변경하면 성장 리포트의 개월 수와 기준선 비교가 달라질 수 있어요.
        </p>
        {fieldErrors.birthDate ? (
          <p className="mt-2 text-xs font-medium text-[#C45B50]">{fieldErrors.birthDate}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <AppButton type="submit" loading={isSaving} className="w-full">
          {isSaving ? '저장 중...' : '저장하기'}
        </AppButton>
        <AppButton
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.push('/mypage')}
          disabled={isSaving}
        >
          취소
        </AppButton>
      </div>
    </form>
  )
}
