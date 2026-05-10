import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

type PageLoadingProps = {
  title?: string
  message?: string
  showBottomNav?: boolean
}

export default function PageLoading({
  title = 'BabyRoad',
  message = '잠시만 기다려 주세요.',
  showBottomNav = true,
}: PageLoadingProps) {
  return (
    <div className="babyroad-page flex min-h-screen flex-col">
      <Header title={title} />

      <main className="flex-1 px-4 py-6 pb-28">
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <div className="h-7 w-40 animate-pulse rounded-full bg-white/72" />
            <div className="mt-2 h-4 w-56 animate-pulse rounded-full bg-white/58" />
          </div>

          <div className="rounded-[1.35rem] border border-white/70 bg-white/70 p-4 shadow-[0_14px_38px_rgba(37,52,74,0.08)]">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-[#EAF6F2]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#EAF6F2]" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#FFF3E9]" />
              </div>
            </div>
          </div>

          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-[1.35rem] border border-white/70 bg-white/62 p-4 shadow-[0_12px_32px_rgba(79,169,154,0.08)]"
            >
              <div className="h-4 w-28 animate-pulse rounded-full bg-[#EAF6F2]" />
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded-full bg-white/80" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-white/80" />
              </div>
            </div>
          ))}

          <p className="text-center text-sm font-medium text-[#6B7A90]">{message}</p>
        </div>
      </main>

      {showBottomNav ? <BottomNav /> : null}
    </div>
  )
}
