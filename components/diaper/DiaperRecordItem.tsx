'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatDateTime } from '@/lib/date'
import type { Tables } from '@/types/database'

const DIAPER_TYPE_LABEL: Record<string, string> = {
  urine: '소변',
  stool: '대변',
  both: '소변+대변',
}

const DIAPER_TYPE_COLOR: Record<string, string> = {
  urine: 'bg-sky-50 text-sky-700',
  stool: 'bg-[#FFF3E9] text-[#D77C5B]',
  both: 'bg-purple-50 text-purple-700',
}

const STOOL_COLOR_LABEL: Record<string, string> = {
  yellow: '노란색',
  brown: '갈색',
  green: '초록색',
  dark: '어두운색',
  red: '붉은색',
  white: '흰색',
  other: '기타',
}

const STOOL_TEXTURE_LABEL: Record<string, string> = {
  watery: '묽음',
  soft: '부드러움',
  normal: '보통',
  hard: '딱딱함',
  mucus: '점액 섞임',
  other: '기타',
}

const AMOUNT_LABEL: Record<string, string> = {
  small: '적음',
  normal: '보통',
  large: '많음',
}

interface DiaperRecordItemProps {
  record: Tables<'child_diaper_records'>
  canEdit?: boolean
}

export default function DiaperRecordItem({ record, canEdit = true }: DiaperRecordItemProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const typeLabel = DIAPER_TYPE_LABEL[record.diaper_type] ?? record.diaper_type
  const colorClass = DIAPER_TYPE_COLOR[record.diaper_type] ?? 'bg-slate-50 text-slate-700'

  async function handleDelete() {
    const confirmed = window.confirm('이 배변 기록을 삭제할까요?')
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('child_diaper_records')
      .update({ deleted_at: now, updated_at: now } as never)
      .eq('id', record.id)
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
            {record.amount && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {AMOUNT_LABEL[record.amount] ?? record.amount}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500">{formatDateTime(record.recorded_at)}</p>
          {record.stool_color && (
            <p className="mt-1 text-xs text-slate-600">
              색상: {STOOL_COLOR_LABEL[record.stool_color] ?? record.stool_color}
            </p>
          )}
          {record.stool_texture && (
            <p className="mt-0.5 text-xs text-slate-600">
              상태: {STOOL_TEXTURE_LABEL[record.stool_texture] ?? record.stool_texture}
            </p>
          )}
          {record.memo && (
            <p className="mt-1 text-xs text-slate-400">{record.memo}</p>
          )}
        </div>

        {canEdit && (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/diaper/${record.id}/edit`}
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
  )
}
