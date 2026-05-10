'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime, formatSleepDuration } from '@/lib/date'
import type { Tables } from '@/types/database'

const SLEEP_TYPE_LABEL: Record<string, string> = {
  day_sleep: '낮잠',
  night_sleep: '밤잠',
}

const SLEEP_TYPE_COLOR: Record<string, string> = {
  day_sleep: 'bg-sky-50 text-sky-700',
  night_sleep: 'bg-indigo-50 text-indigo-700',
}

interface SleepRecordItemProps {
  record: Tables<'child_sleep_records'>
}

export default function SleepRecordItem({ record }: SleepRecordItemProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const typeLabel = SLEEP_TYPE_LABEL[record.sleep_type] ?? record.sleep_type
  const colorClass = SLEEP_TYPE_COLOR[record.sleep_type] ?? 'bg-slate-50 text-slate-700'
  const duration = formatSleepDuration(record.sleep_start, record.sleep_end)

  async function handleDelete() {
    const confirmed = window.confirm(
      '이 수면 기록을 삭제할까요? 삭제하면 최근 수면 기록에서도 제외됩니다.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('child_sleep_records')
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
            <span className="text-sm font-semibold text-slate-900">{duration}</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            {formatDateTime(record.sleep_start)}
            {record.sleep_end && ` ~ ${formatDateTime(record.sleep_end)}`}
          </p>
          {record.wake_count > 0 && (
            <p className="mt-1 text-xs text-amber-700">중간에 {record.wake_count}회 깸</p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={`/sleep/${record.id}/edit`}
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
      </div>
    </div>
  )
}
