'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Card from '@/components/common/Card'
import { formatDate } from '@/lib/date'
import { formatNumber } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { ChildGrowthRecord } from '@/types/child'

interface GrowthRecordItemProps {
  record: ChildGrowthRecord
  canEdit?: boolean
}

export default function GrowthRecordItem({ record, canEdit = true }: GrowthRecordItemProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    const confirmed = window.confirm(
      '이 성장 기록을 삭제할까요? 삭제하면 성장 리포트 그래프에서도 제외됩니다.'
    )
    if (!confirmed) return

    setIsDeleting(true)
    const supabase = createClient()
    const now = new Date().toISOString()

    const { error } = await supabase
      .from('child_growth_records')
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
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {formatDate(record.record_date)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            저장일 {formatDate(record.created_at)}
          </p>
        </div>
        {canEdit && (
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/growth/${record.id}/edit`}
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

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="키" value={record.height !== null ? `${formatNumber(record.height)} cm` : '-'} />
        <Metric label="몸무게" value={record.weight !== null ? `${formatNumber(record.weight, 2)} kg` : '-'} />
        <Metric
          label="머리둘레"
          value={record.head_circumference !== null ? `${formatNumber(record.head_circumference)} cm` : '-'}
        />
      </div>

      {record.memo ? (
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
          {record.memo}
        </p>
      ) : null}
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#EAF6F2]/50 px-3 py-2">
      <p className="text-xs text-[#6B7A90]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#25344A]">{value}</p>
    </div>
  )
}
