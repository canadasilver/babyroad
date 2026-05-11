'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import AppButton from '@/components/ui/AppButton'
import { createClient } from '@/lib/supabase/client'
import type { ChildGender, ChildStatus } from '@/types/child'
import type { TablesInsert } from '@/types/database'

const childNewSchema = z
  .object({
    name: z.string().trim().min(1, '아이 이름을 입력해 주세요.').max(30, '아이 이름은 30자 이내로 입력해 주세요.'),
    gender: z.enum(['male', 'female', 'unknown']),
    status: z.enum(['pregnancy', 'born']),
    dateValue: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.dateValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: data.status === 'born' ? '생년월일을 입력해 주세요.' : '출산예정일을 입력해 주세요.',
        path: ['dateValue'],
      })
      return
    }

    const selectedDate = new Date(`${data.dateValue}T00:00:00`)
    if (Number.isNaN(selectedDate.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '올바른 날짜를 입력해 주세요.',
        path: ['dateValue'],
      })
    }
  })

type FieldErrors = Partial<Record<'name' | 'gender' | 'status' | 'dateValue', string>>

const STATUS_OPTIONS: Array<{ value: ChildStatus; label: string }> = [
  { value: 'pregnancy', label: '임신 중' },
  { value: 'born', label: '출생 후' },
]

const GENDER_OPTIONS: Array<{ value: ChildGender; label: string }> = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
  { value: 'unknown', label: '아직 모르겠어요' },
]

export default function ChildNewForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<ChildGender>('unknown')
  const [status, setStatus] = useState<ChildStatus>('born')
  const [dateValue, setDateValue] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function validate() {
    const result = childNewSchema.safeParse({ name, gender, status, dateValue })

    if (result.success) {
      setFieldErrors({})
      return result.data
    }

    const nextErrors: FieldErrors = {}
    result.error.errors.forEach((error) => {
      const field = error.path[0]
      if (field === 'name' || field === 'gender' || field === 'status' || field === 'dateValue') {
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
    const payload: TablesInsert<'children'> = {
      user_id: userId,
      name: data.name,
      gender: data.gender,
      status: data.status,
      is_premature: false,
      due_date: data.status === 'pregnancy' ? data.dateValue : null,
      birth_date: data.status === 'born' ? data.dateValue : null,
    }

    const { data: child, error: childError } = await supabase
      .from('children')
      .insert(payload as never)
      .select('id')
      .single()

    const insertedChild = child as { id: string } | null

    if (childError || !insertedChild) {
      setMessage('아이 정보 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsSaving(false)
      return
    }

    const now = new Date().toISOString()
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ active_child_id: insertedChild.id, updated_at: now } as never)
      .eq('user_id', userId)
      .is('deleted_at', null)

    if (profileError) {
      setMessage('아이 정보는 저장되었지만 현재 아이 설정 중 문제가 발생했습니다. 마이페이지에서 다시 선택해 주세요.')
      setIsSaving(false)
      return
    }

    // 아이 생성자를 owner collaborator로 등록
    await supabase
      .from('child_collaborators')
      .upsert(
        { child_id: insertedChild.id, user_id: userId, role: 'owner', status: 'active', accepted_at: now } as never,
        { onConflict: 'child_id,user_id' }
      )

    router.refresh()
    router.replace('/mypage')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {message ? (
        <div
          role="alert"
          className="rounded-[1.25rem] border border-[#F4C8C1] bg-[#FFF0EF]/86 px-4 py-3 text-sm text-[#C45B50]"
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
        {fieldErrors.name ? <p className="mt-2 text-xs font-medium text-[#C45B50]">{fieldErrors.name}</p> : null}
      </div>

      <div>
        <span className="block text-sm font-bold text-[#25344A]">현재 상태</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setStatus(option.value)
                setDateValue('')
              }}
              className={`min-h-12 rounded-2xl border px-3 text-sm font-bold transition-colors ${
                status === option.value
                  ? 'border-[#4FA99A] bg-[#EAF6F2] text-[#2F766E] shadow-[0_8px_18px_rgba(79,169,154,0.12)]'
                  : 'border-[#D9E6DF] bg-white/78 text-[#6B7A90] hover:border-[#CFE3D8]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
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
      </div>

      <div>
        <label htmlFor="child-date" className="block text-sm font-bold text-[#25344A]">
          {status === 'born' ? '생년월일' : '출산예정일'}
        </label>
        <input
          id="child-date"
          type="date"
          value={dateValue}
          onChange={(event) => setDateValue(event.target.value)}
          className="babyroad-input min-h-12"
        />
        <p className="mt-2 rounded-2xl border border-[#F6D7C8] bg-[#FFF3E9]/72 px-3 py-2 text-xs leading-5 text-[#B86C4E]">
          생년월일은 성장 리포트와 발달 가이드의 개월 수 계산에 사용돼요.
        </p>
        {fieldErrors.dateValue ? (
          <p className="mt-2 text-xs font-medium text-[#C45B50]">{fieldErrors.dateValue}</p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
        <AppButton type="submit" loading={isSaving} className="w-full">
          {isSaving ? '저장 중...' : '아이 추가하기'}
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
