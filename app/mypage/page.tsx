import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'
import ChildAvatar from '@/components/child/ChildAvatar'
import ChildPhotoUploader from '@/components/child/ChildPhotoUploader'
import { getAgeLabel } from '@/lib/date'
import LogoutButton from '@/components/auth/LogoutButton'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import GrowthReportCard from '@/components/growth-report/GrowthReportCard'
import type { Child, ChildGrowthRecord } from '@/types/child'

export const metadata: Metadata = {
  title: '마이페이지 | BabyRoad',
}

export default async function MypagePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = await createClient()
  const { data: childrenData } = await supabase
    .from('children')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  const children = (childrenData ?? []) as Child[]
  const child = children[0] ?? null
  let latestGrowthRecord: ChildGrowthRecord | null = null

  if (child) {
    const { data: latestGrowthData } = await supabase
      .from('child_growth_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('child_id', child.id)
      .is('deleted_at', null)
      .order('record_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    latestGrowthRecord = latestGrowthData as ChildGrowthRecord | null
  }

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="마이페이지" />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <h1 className="babyroad-title">마이페이지</h1>
            <p className="babyroad-subtitle">안녕하세요, {profile.nickname}님</p>
          </div>

          <Card>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#EAF6F2] text-lg font-black text-[#4FA99A]">
                Me
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">{profile.nickname}</p>
                {profile.email && (
                  <p className="mt-0.5 truncate text-sm text-slate-500">{profile.email}</p>
                )}
              </div>
            </div>
          </Card>

          {child && (
            <Card variant="hero" className="relative overflow-hidden border-white/70">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#CFE3D8]/55" />
              <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-[#F6B092]/20" />
              <div className="relative flex items-start gap-3 min-[380px]:gap-4">
                <ChildAvatar
                  photoUrl={child.profile_image_url}
                  gender={child.gender}
                  status={child.status}
                  size="md"
                  className="bg-white/72 shadow-[0_10px_24px_rgba(37,52,74,0.10)]"
                />
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs font-semibold text-[#4FA99A]">우리 아이</p>
                  <h2 className="truncate text-xl font-black text-[#25344A]">{child.name}</h2>
                  <p className="text-sm font-medium text-[#6B7A90]">
                    {getAgeLabel({ status: child.status, birthDate: child.birth_date, dueDate: child.due_date })}
                    {child.status === 'born' && ` · ${{ male: '남아', female: '여아', unknown: '미정' }[child.gender] ?? '미정'}`}
                  </p>
                </div>
                <ChildPhotoUploader
                  userId={user.id}
                  childId={child.id}
                  currentPhotoUrl={child.profile_image_url}
                  gender={child.gender}
                  status={child.status}
                  compact
                  editHref="/mypage/child/edit"
                />
              </div>
            </Card>
          )}

          {child && (
            <GrowthReportCard
              child={child}
              latestRecord={latestGrowthRecord}
            />
          )}

          {!child && (
            <Card className="border-dashed py-6 text-center">
              <p className="text-sm text-slate-500">아직 등록된 아이 정보가 없어요.</p>
              <a
                href="/onboarding"
                className="mt-3 inline-flex min-h-11 items-center rounded-2xl bg-[#4FA99A] px-4 py-2 text-sm font-semibold text-white"
              >
                아이 정보 등록하기
              </a>
            </Card>
          )}

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">메뉴</h3>
            <div className="space-y-1">
              <a
                href="/growth"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">성장 기록</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/vaccinations"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">예방접종</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/feeding"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">수유/식사 기록</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/sleep"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">수면 기록</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/health"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">건강 기록</span>
                <span className="text-slate-400">›</span>
              </a>
            </div>
          </Card>

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">계정</h3>
            <LogoutButton className="w-full justify-center rounded-xl border border-[#D9E6DF] py-3 text-center" />
          </Card>

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
