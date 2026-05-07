import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: 'Supabase 연결 테스트',
}

type Vaccine = Tables<'vaccines'>

type FetchResult =
  | { ok: true; data: Vaccine[] }
  | { ok: false; message: string }

async function fetchVaccines(): Promise<FetchResult> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('vaccines')
      .select('id, name, description, is_required, created_at, updated_at, deleted_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      return { ok: false, message: '데이터 조회에 실패했습니다. RLS 정책 및 스키마를 확인해 주세요.' }
    }

    return { ok: true, data: data ?? [] }
  } catch {
    return { ok: false, message: '환경변수를 확인해 주세요 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)' }
  }
}

function StatusBanner({ ok }: { ok: boolean }) {
  if (ok) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-green-700">
        <span className="text-lg">✅</span>
        <span className="text-sm font-semibold">Supabase 연결 성공</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-red-700">
      <span className="text-lg">❌</span>
      <span className="text-sm font-semibold">Supabase 연결에 실패했습니다.</span>
    </div>
  )
}

function ErrorDetail({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-xs font-medium text-red-600">오류 상세</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <div className="mt-3 rounded-lg bg-white p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-700">확인 사항</p>
        <ul className="mt-1 space-y-1 list-disc pl-4">
          <li>.env.local 파일에 NEXT_PUBLIC_SUPABASE_URL 이 있는지 확인</li>
          <li>.env.local 파일에 NEXT_PUBLIC_SUPABASE_ANON_KEY 가 있는지 확인</li>
          <li>Supabase 프로젝트가 활성 상태인지 확인</li>
          <li>DB 스키마 및 seed 데이터가 적용되었는지 확인</li>
        </ul>
      </div>
    </div>
  )
}

function VaccineCard({ vaccine }: { vaccine: Vaccine }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">{vaccine.name}</p>
          {vaccine.description && (
            <p className="mt-1 text-sm text-slate-500">{vaccine.description}</p>
          )}
        </div>
        <span
          className={[
            'flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
            vaccine.is_required
              ? 'bg-orange-100 text-orange-700'
              : 'bg-slate-100 text-slate-500',
          ].join(' ')}
        >
          {vaccine.is_required ? '필수' : '선택'}
        </span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
      <p className="text-sm text-slate-400">등록된 예방접종 데이터가 없습니다.</p>
      <p className="mt-1 text-xs text-slate-400">
        supabase/seed.sql 을 실행해 샘플 데이터를 추가해 주세요.
      </p>
    </div>
  )
}

export default async function SupabaseTestPage() {
  const result = await fetchVaccines()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-5">

        {/* 헤더 */}
        <div>
          <h1 className="text-xl font-bold text-slate-900">Supabase 연결 테스트</h1>
          <p className="mt-1 text-sm text-slate-500">vaccines 테이블 조회로 연결을 확인합니다.</p>
        </div>

        {/* 연결 상태 */}
        <StatusBanner ok={result.ok} />

        {/* 오류 상세 */}
        {!result.ok && <ErrorDetail message={result.message} />}

        {/* 예방접종 목록 */}
        {result.ok && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">예방접종 목록</h2>
              <span className="text-xs text-slate-400">{result.data.length}건</span>
            </div>

            {result.data.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {result.data.map((vaccine) => (
                  <VaccineCard key={vaccine.id} vaccine={vaccine} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 하단 안내 */}
        <div className="rounded-xl bg-blue-50 p-4 text-xs text-blue-600">
          <p className="font-medium">이 페이지는 개발용 테스트 페이지입니다.</p>
          <p className="mt-1 text-blue-500">운영 배포 전 이 경로를 비활성화하거나 삭제해 주세요.</p>
        </div>

      </div>
    </main>
  )
}
