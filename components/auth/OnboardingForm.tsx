'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/common/Button'
import type { TablesInsert } from '@/types/database'

const onboardingSchema = z
  .object({
    nickname: z
      .string()
      .min(1, '닉네임을 입력해 주세요')
      .max(20, '닉네임은 20자 이내로 입력해 주세요'),
    childName: z
      .string()
      .min(1, '아이 이름 또는 태명을 입력해 주세요')
      .max(30, '이름은 30자 이내로 입력해 주세요'),
    status: z.enum(['pregnancy', 'born']),
    gender: z.enum(['male', 'female', 'unknown']),
    dueDate: z.string().optional(),
    birthDate: z.string().optional(),
    birthWeight: z.string().optional(),
    birthHeight: z.string().optional(),
    birthHeadCircumference: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'pregnancy') return !!data.dueDate
      return !!data.birthDate
    },
    { message: '날짜를 입력해 주세요', path: ['date'] }
  )

type FormData = z.infer<typeof onboardingSchema>

interface OnboardingFormProps {
  userId: string
  email: string | null
  avatarUrl: string | null
  provider: string
}

function parseValidNumber(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = parseFloat(value)
  return !isNaN(n) && n > 0 ? n : undefined
}

const STATUS_OPTIONS = [
  { value: 'pregnancy', label: '🤰 임신 중' },
  { value: 'born', label: '👶 출생 후' },
] as const

const GENDER_OPTIONS = [
  { value: 'male', label: '남아' },
  { value: 'female', label: '여아' },
  { value: 'unknown', label: '아직 모름' },
] as const

export default function OnboardingForm({
  userId,
  email,
  avatarUrl,
  provider,
}: OnboardingFormProps) {
  const router = useRouter()

  const [status, setStatus] = useState<'pregnancy' | 'born'>('born')
  const [gender, setGender] = useState<'male' | 'female' | 'unknown'>('unknown')
  const [nickname, setNickname] = useState('')
  const [childName, setChildName] = useState('')
  const [dateValue, setDateValue] = useState('')
  const [birthWeight, setBirthWeight] = useState('')
  const [birthHeight, setBirthHeight] = useState('')
  const [birthHeadCircumference, setBirthHeadCircumference] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function validate(): FormData | null {
    const result = onboardingSchema.safeParse({
      nickname: nickname.trim(),
      childName: childName.trim(),
      status,
      gender,
      dueDate: status === 'pregnancy' ? dateValue : undefined,
      birthDate: status === 'born' ? dateValue : undefined,
      birthWeight: birthWeight || undefined,
      birthHeight: birthHeight || undefined,
      birthHeadCircumference: birthHeadCircumference || undefined,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        const key = String(err.path[0])
        fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return null
    }

    setErrors({})
    return result.data
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = validate()
    if (!data) return

    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()

      const profileData: TablesInsert<'profiles'> = {
        user_id: userId,
        nickname: data.nickname,
        email,
        avatar_url: avatarUrl,
        provider,
        role: 'user',
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: profileError } = await supabase.from('profiles').insert(profileData as any)

      if (profileError) {
        if (profileError.code === '23505') {
          router.replace('/dashboard')
          return
        }
        setErrorMessage('프로필 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      const childData: TablesInsert<'children'> = {
        user_id: userId,
        name: data.childName,
        gender: data.gender,
        status: data.status,
        is_premature: false,
        due_date: data.status === 'pregnancy' ? data.dueDate : undefined,
        birth_date: data.status === 'born' ? data.birthDate : undefined,
        birth_weight: parseValidNumber(data.birthWeight),
        birth_height: parseValidNumber(data.birthHeight),
        birth_head_circumference: parseValidNumber(data.birthHeadCircumference),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: insertedChild, error: childError } = await supabase
        .from('children')
        .insert(childData as any)
        .select('id')
        .single()

      if (childError || !insertedChild) {
        setErrorMessage('아이 정보 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
        return
      }

      const childId = (insertedChild as { id: string }).id
      const now = new Date().toISOString()

      // 첫 아이를 active_child_id로 설정
      await supabase
        .from('profiles')
        .update({ active_child_id: childId, updated_at: now } as never)
        .eq('user_id', userId)
        .is('deleted_at', null)

      // 아이 생성자를 owner collaborator로 등록
      await supabase
        .from('child_collaborators')
        .upsert(
          { child_id: childId, user_id: userId, role: 'owner', status: 'active', accepted_at: now } as never,
          { onConflict: 'child_id,user_id' }
        )

      router.replace('/dashboard')
    } catch {
      setErrorMessage('저장 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div role="alert" className="rounded-[1.25rem] border border-[#F4C8C1] bg-[#FFF0EF]/86 px-4 py-3 text-sm text-[#C45B50]">
          {errorMessage}
        </div>
      )}

      {/* 닉네임 */}
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-slate-700">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="사용할 닉네임을 입력해 주세요"
          className="babyroad-input"
          maxLength={20}
        />
        {errors.nickname && (
          <p className="mt-1 text-xs text-red-500">{errors.nickname}</p>
        )}
      </div>

      {/* 임신 중 / 출생 후 */}
      <div>
        <span className="block text-sm font-medium text-slate-700">현재 상태</span>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setStatus(option.value)
                setDateValue('')
              }}
              className={`rounded-xl border py-3 text-sm font-medium transition-colors ${
                status === option.value
                  ? 'border-[#4FA99A] bg-[#EAF6F2] text-[#2F766E] shadow-sm'
                  : 'border-[#D9E6DF] bg-white/80 text-[#6B7A90] hover:border-[#CFE3D8]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 아이 이름 / 태명 */}
      <div>
        <label htmlFor="childName" className="block text-sm font-medium text-slate-700">
          {status === 'pregnancy' ? '태명' : '아이 이름'}
        </label>
        <input
          id="childName"
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder={
            status === 'pregnancy' ? '태명을 입력해 주세요' : '아이 이름을 입력해 주세요'
          }
          className="babyroad-input"
          maxLength={30}
        />
        {errors.childName && (
          <p className="mt-1 text-xs text-red-500">{errors.childName}</p>
        )}
      </div>

      {/* 성별 */}
      <div>
        <span className="block text-sm font-medium text-slate-700">성별</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {GENDER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGender(option.value)}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                gender === option.value
                  ? 'border-[#4FA99A] bg-[#EAF6F2] text-[#2F766E] shadow-sm'
                  : 'border-[#D9E6DF] bg-white/80 text-[#6B7A90] hover:border-[#CFE3D8]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 출산예정일 / 출생일 */}
      <div>
        <label htmlFor="dateValue" className="block text-sm font-medium text-slate-700">
          {status === 'pregnancy' ? '출산예정일' : '출생일'}
        </label>
        <input
          id="dateValue"
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="babyroad-input"
        />
        {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
      </div>

      {/* 출생 정보 — 출생 후일 때만, 선택 입력 */}
      {status === 'born' && (
        <div className="rounded-[1.25rem] border border-[#E8EEE9] bg-white/58 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">
            출생 정보{' '}
            <span className="font-normal text-slate-400">(선택)</span>
          </p>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="birthWeight"
                className="block text-xs font-medium text-slate-600"
              >
                출생 체중 (kg)
              </label>
              <input
                id="birthWeight"
                type="number"
                value={birthWeight}
                onChange={(e) => setBirthWeight(e.target.value)}
                placeholder="예: 3.20"
                step="0.01"
                min="0"
                max="10"
                className="babyroad-input"
              />
            </div>
            <div>
              <label
                htmlFor="birthHeight"
                className="block text-xs font-medium text-slate-600"
              >
                출생 키 (cm)
              </label>
              <input
                id="birthHeight"
                type="number"
                value={birthHeight}
                onChange={(e) => setBirthHeight(e.target.value)}
                placeholder="예: 50.0"
                step="0.1"
                min="0"
                max="100"
                className="babyroad-input"
              />
            </div>
            <div>
              <label
                htmlFor="birthHeadCircumference"
                className="block text-xs font-medium text-slate-600"
              >
                출생 머리둘레 (cm)
              </label>
              <input
                id="birthHeadCircumference"
                type="number"
                value={birthHeadCircumference}
                onChange={(e) => setBirthHeadCircumference(e.target.value)}
                placeholder="예: 34.0"
                step="0.1"
                min="0"
                max="60"
                className="babyroad-input"
              />
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={loading}
        className="w-full"
      >
        {loading ? '저장 중...' : '시작하기'}
      </Button>
    </form>
  )
}
