import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getAuthUser, getProfile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import AppCard from '@/components/ui/AppCard'
import EmptyState from '@/components/ui/EmptyState'
import ChildAvatar from '@/components/child/ChildAvatar'
import { getAgeInMonths } from '@/lib/date'
import type { Child } from '@/types/child'
import type { Tables } from '@/types/database'

export const metadata: Metadata = {
  title: '발달 가이드 | BabyRoad',
}

const SECTION_CONFIGS: {
  key: 'milestones' | 'parent_roles' | 'play_ideas' | 'care_tips' | 'caution_notes'
  label: string
  dot: string
}[] = [
  { key: 'milestones', label: '이 시기에 자주 보이는 모습', dot: 'bg-[#4FA99A]' },
  { key: 'parent_roles', label: '부모가 해줄 수 있는 것', dot: 'bg-[#F6B092]' },
  { key: 'play_ideas', label: '오늘 해볼 놀이', dot: 'bg-[#9BB8F0]' },
  { key: 'care_tips', label: '생활 관리 팁', dot: 'bg-[#7DC060]' },
  { key: 'caution_notes', label: '주의 깊게 볼 점', dot: 'bg-[#D4924A]' },
]

export default async function DevelopmentPage() {
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

  const child = ((childrenData ?? []) as Child[])[0] ?? null
  if (!child) redirect('/onboarding')

  const ageInMonths = child.birth_date ? getAgeInMonths(child.birth_date) : null
  let guide: Tables<'development_guides'> | null = null
  if (ageInMonths !== null) {
    const { data } = await supabase
      .from('development_guides')
      .select('*')
      .eq('is_active', true)
      .lte('min_month', ageInMonths)
      .or(`max_month.is.null,max_month.gte.${ageInMonths}`)
      .order('sort_order', { ascending: true })
      .limit(1)
      .maybeSingle()
    guide = data as Tables<'development_guides'> | null
  }
  const ageRangeLabel = guide
    ? guide.max_month === null
      ? `${guide.min_month}개월 이상`
      : `${guide.min_month}~${guide.max_month}개월`
    : null

  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="발달 가이드" showBack />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <section>
            <h1 className="babyroad-title">발달 가이드</h1>
            <p className="babyroad-subtitle">
              우리 아이 월령에 맞는 발달 정보와 오늘 해볼 놀이를 확인해보세요.
            </p>
          </section>

          {/* 아이 정보 hero 카드 */}
          <AppCard variant="hero" className="relative overflow-hidden border-white/70">
            <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#CFE3D8]/55" />
            <div className="pointer-events-none absolute -bottom-10 left-10 h-24 w-24 rounded-full bg-[#F6B092]/20" />
            <div className="relative flex items-center gap-4">
              <ChildAvatar
                photoUrl={child.profile_image_url}
                gender={child.gender}
                status={child.status}
                size="md"
                className="bg-white/72 shadow-[0_10px_24px_rgba(37,52,74,0.10)]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#4FA99A]">발달 가이드 대상</p>
                <h2 className="mt-0.5 truncate text-xl font-black text-[#25344A]">{child.name}</h2>
                {ageInMonths !== null ? (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-full bg-[#EAF6F2] px-2.5 py-0.5 text-xs font-semibold text-[#2F8F84]">
                      {ageInMonths}개월
                    </span>
                    <span className="text-sm text-[#6B7A90]">{ageRangeLabel} 가이드</span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-[#9AA8BA]">생년월일 미등록</p>
                )}
              </div>
            </div>
          </AppCard>

          {/* birth_date 없으면 안내 */}
          {ageInMonths === null && (
            <EmptyState
              title="아이 생년월일을 입력하면 맞춤 가이드를 볼 수 있어요"
              description="마이페이지에서 아이 정보를 업데이트해주세요."
            />
          )}

          {/* 가이드 본문 */}
          {guide && (
            <>
              {/* 가이드 제목 */}
              <AppCard variant="soft">
                <p className="text-xs font-semibold text-[#4FA99A]">{ageRangeLabel}</p>
                <h3 className="mt-1 text-lg font-black text-[#25344A]">{guide.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#6B7A90]">{guide.summary}</p>
              </AppCard>

              {/* 섹션 카드들 */}
              {SECTION_CONFIGS.map((section) => {
                const items = guide[section.key] as string[]
                if (items.length === 0) return null
                return (
                  <AppCard key={section.key}>
                    <div className="mb-3 flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${section.dot}`} />
                      <h4 className="text-sm font-bold text-[#25344A]">{section.label}</h4>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${section.dot} opacity-70`} />
                          <span className="text-sm leading-6 text-[#3D4F65]">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </AppCard>
                )
              })}

              {/* 출처 안내 */}
              {(guide.source_summary || guide.source_links.length > 0) && (
                <AppCard className="border-[#CFE3D8] bg-[#F6FAFE]/80">
                  {guide.source_summary && (
                    <p className="text-xs leading-relaxed text-[#5A7A8A]">{guide.source_summary}</p>
                  )}
                  {guide.source_links.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {(guide.source_links as { label: string; url: string }[]).map((link, idx) => (
                        <li key={idx}>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#4FA99A] underline underline-offset-2"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </AppCard>
              )}

              {/* 의료 안내 */}
              <AppCard className="border-[#F6D6C4] bg-[#FFF7DF]/78 shadow-[0_10px_26px_rgba(246,176,146,0.10)]">
                <p className="text-xs leading-relaxed text-[#9A6A38]">
                  발달 가이드는 월령에 따른 일반적인 참고 정보입니다. 아이마다 발달 속도는 다를 수 있으며,
                  걱정되는 부분은 소아청소년과 또는 영유아 건강검진에서 상담해주세요.
                </p>
              </AppCard>
            </>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
