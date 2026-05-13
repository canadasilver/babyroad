'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/date'
import type { Tables } from '@/types/database'

interface HealthRecordItemProps {
  record: Tables<'child_health_records'>
  canEdit?: boolean
}

export default function HealthRecordItem({ record, canEdit = true }: HealthRecordItemProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      '이 건강 기록을 삭제할까요? 삭제하면 최근 건강 기록에서도 제외됩니다.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('child_health_records')
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
          <p className="text-xs text-slate-500">{formatDateTime(record.recorded_at)}</p>
          {record.temperature !== null && (
            <p className="mt-1 text-sm font-semibold text-slate-900">
              체온{' '}
              <span className={record.temperature >= 37.5 ? 'text-red-600' : 'text-slate-900'}>
                {record.temperature}℃
              </span>
            </p>
          )}
          {record.symptoms && (
            <p className="mt-1 text-sm text-slate-800">증상: {record.symptoms}</p>
          )}
          {record.medicine && (
            <p className="mt-1 text-xs text-slate-600">약 복용: {record.medicine}</p>
          )}
          {record.hospital_name && (
            <p className="mt-1 text-xs text-slate-600">병원: {record.hospital_name}</p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {record.temperature !== null && record.temperature >= 37.5 && (
            <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
              발열
            </span>
          )}
          {canEdit && (
            <div className="flex items-center gap-2">
              <Link
                href={`/health/${record.id}/edit`}
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
