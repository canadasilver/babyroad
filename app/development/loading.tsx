import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function DevelopmentLoading() {
  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title="발달 가이드" showBack />
      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div className="h-8 w-40 animate-pulse rounded-xl bg-[#D9E6DF]" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-[#E8EEE9]" />
          <div className="h-28 animate-pulse rounded-[1.35rem] bg-[#EAF6F2]/60" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-[1.35rem] bg-white/70" />
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
