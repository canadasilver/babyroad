import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getAuthUser, getProfile } from '@/lib/auth'
import { getActiveChildContext } from '@/lib/children'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Card from '@/components/common/Card'
import ChildAvatar from '@/components/child/ChildAvatar'
import ChildPhotoUploader from '@/components/child/ChildPhotoUploader'
import ChildSwitcherButton from '@/components/child/ChildSwitcherButton'
import { getAgeLabel } from '@/lib/date'
import LogoutButton from '@/components/auth/LogoutButton'
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer'
import GrowthReportCard from '@/components/growth-report/GrowthReportCard'
import { createClient } from '@/lib/supabase/server'
import type { ChildGrowthRecord } from '@/types/child'

export const metadata: Metadata = {
  title: '마이페이지 | BabyRoad',
}

export default async function MypagePage() {
  const user = await getAuthUser()
  if (!user) redirect('/login')

  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const { children: allChildren, activeChild } = await getActiveChildContext(user.id, profile)
  const otherChildren = allChildren.filter((c) => c.id !== activeChild?.id)

  let latestGrowthRecord: ChildGrowthRecord | null = null

  if (activeChild) {
    const supabase = await createClient()
    const { data: latestGrowthData } = await supabase
      .from('child_growth_records')
      .select('*')
      .eq('user_id', user.id)
      .eq('child_id', activeChild.id)
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

          {/* 현재 선택된 아이 — Hero 카드 */}
          {activeChild ? (
            <Card variant="hero" className="relative overflow-hidden border-white/70">
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#CFE3D8]/55" />
              <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-[#F6B092]/20" />
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-full bg-[#4FA99A]/15 px-2.5 py-0.5 text-xs font-semibold text-[#2F766E]">
                    현재 선택 중
                  </span>
                </div>
                <div className="flex items-start gap-3 min-[380px]:gap-4">
                  <ChildAvatar
                    photoUrl={activeChild.profile_image_url}
                    gender={activeChild.gender}
                    status={activeChild.status}
                    size="md"
                    className="bg-white/72 shadow-[0_10px_24px_rgba(37,52,74,0.10)]"
                  />
                  <div className="min-w-0 flex-1 pt-1">
                    <p className="text-xs font-semibold text-[#4FA99A]">우리 아이</p>
                    <h2 className="truncate text-xl font-black text-[#25344A]">{activeChild.name}</h2>
                    <p className="text-sm font-medium text-[#6B7A90]">
                      {getAgeLabel({ status: activeChild.status, birthDate: activeChild.birth_date, dueDate: activeChild.due_date })}
                      {activeChild.status === 'born' && ` · ${{ male: '남아', female: '여아', unknown: '미정' }[activeChild.gender] ?? '미정'}`}
                    </p>
                  </div>
                  <ChildPhotoUploader
                    userId={user.id}
                    childId={activeChild.id}
                    currentPhotoUrl={activeChild.profile_image_url}
                    gender={activeChild.gender}
                    status={activeChild.status}
                    compact
                    editHref={`/mypage/child/${activeChild.id}/edit`}
                  />
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border-dashed py-6 text-center">
              <p className="text-sm text-slate-500">아직 등록된 아이 정보가 없어요.</p>
              <Link
                href="/mypage/child/new"
                className="mt-3 inline-flex min-h-11 items-center rounded-2xl bg-[#4FA99A] px-4 py-2 text-sm font-semibold text-white"
              >
                아이 정보 등록하기
              </Link>
            </Card>
          )}

          {/* 다른 아이 목록 */}
          {otherChildren.length > 0 && (
            <div className="space-y-2">
              <p className="px-1 text-xs font-semibold text-slate-500">다른 아이</p>
              {otherChildren.map((child) => (
                <Card key={child.id} className="!p-3">
                  <div className="flex items-center gap-3">
                    <ChildAvatar
                      photoUrl={child.profile_image_url}
                      gender={child.gender}
                      status={child.status}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#25344A]">{child.name}</p>
                      <p className="text-xs text-[#6B7A90]">
                        {getAgeLabel({ status: child.status, birthDate: child.birth_date, dueDate: child.due_date })}
                        {child.status === 'born' && ` · ${{ male: '남아', female: '여아', unknown: '미정' }[child.gender] ?? '미정'}`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/mypage/child/${child.id}/edit`}
                        className="rounded-full bg-[#EAF6F2] px-2.5 py-1 text-xs font-semibold text-[#2F8F84] transition-colors hover:bg-[#D4EDE6]"
                      >
                        수정
                      </Link>
                      <ChildSwitcherButton userId={user.id} childId={child.id} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 아이 추가하기 */}
          <Link
            href="/mypage/child/new"
            className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-dashed border-[#CFE3D8] bg-white/55 py-3 text-sm font-semibold text-[#4FA99A] transition-colors hover:bg-[#EAF6F2]/60"
          >
            <span className="text-base leading-none">+</span>
            아이 추가하기
          </Link>

          {/* 성장 리포트 */}
          {activeChild && (
            <GrowthReportCard
              child={activeChild}
              latestRecord={latestGrowthRecord}
            />
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

          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">서비스 정보</h3>
            <div className="space-y-1">
              <a
                href="/privacy"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">개인정보처리방침</span>
                <span className="text-slate-400">›</span>
              </a>
              <a
                href="/terms"
                className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-[#EAF6F2]/70"
              >
                <span className="text-sm font-medium text-[#25344A]">이용약관</span>
                <span className="text-slate-400">›</span>
              </a>
            </div>
          </Card>

          <MedicalDisclaimer />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
