'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/date'
import type { Tables } from '@/types/database'

const FEEDING_TYPE_LABEL: Record<string, string> = {
  breast_milk: '모유',
  formula: '분유',
  baby_food: '이유식',
  solid_food: '유아식',
  snack: '간식',
  water: '물',
}

const UNIT_LABEL: Record<string, string> = {
  ml: 'ml',
  g: 'g',
  count: '회',
  spoon: '숟가락',
  other: '',
}

const TYPE_COLOR: Record<string, string> = {
  breast_milk: 'bg-pink-50 text-pink-700',
  formula: 'bg-blue-50 text-blue-700',
  baby_food: 'bg-green-50 text-green-700',
  solid_food: 'bg-[#FFF3E9] text-[#D77C5B]',
  snack: 'bg-yellow-50 text-yellow-700',
  water: 'bg-sky-50 text-sky-700',
}

interface FeedingRecordItemProps {
  record: Tables<'child_feeding_records'>
  canEdit?: boolean
}

export default function FeedingRecordItem({ record, canEdit = true }: FeedingRecordItemProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const typeLabel = FEEDING_TYPE_LABEL[record.feeding_type] ?? record.feeding_type
  const colorClass = TYPE_COLOR[record.feeding_type] ?? 'bg-slate-50 text-slate-700'
  const unitLabel = record.unit ? (UNIT_LABEL[record.unit] ?? record.unit) : ''

  async function handleDelete() {
    const confirmed = window.confirm(
      '이 수유/식사 기록을 삭제할까요? 삭제하면 최근 수유 기록에서도 제외됩니다.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('child_feeding_records')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', record.id)
      .eq('user_id', record.user_id)
      .eq('child_id', record.child_id)
      .is('deleted_at', null)

    if (error) {
      alert('삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
      setIsDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="rounded-[1.35rem] border border-[#E8EEE9] bg-white/85 p-4 shadow-[0_14px_38px_rgba(37,52,74,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
              {typeLabel}
            </span>
            {record.food_name && (
              <span className="text-xs text-slate-600">{record.food_name}</span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{formatDateTime(record.recorded_at)}</p>
          {record.reaction && (
            <p className="mt-1 text-xs text-amber-700">반응: {record.reaction}</p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {record.amount !== null && (
            <p className="text-sm font-semibold text-slate-900">
              {record.amount}{unitLabel}
            </p>
          )}
          {canEdit && (
            <div className="flex items-center gap-2">
              <Link
                href={`/feeding/${record.id}/edit`}
                className="rounded-full bg-[#EAF6F2] px-3 py-1 text-xs font-semibold text-[#2F8F84] transition-colors hover:bg-[#D4EDE6]"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#C47B5A] transition-colors hover:bg-[#FDEADE] disabled:opacity-50"
              >
                {isDeleting ? '삭제 중' : '삭제'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
