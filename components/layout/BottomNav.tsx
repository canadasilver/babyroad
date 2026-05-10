'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '홈', icon: HomeIcon },
  { href: '/growth', label: '성장', icon: GrowthIcon },
  { href: '/vaccinations', label: '예방접종', icon: VaccineIcon },
  { href: '/community', label: '커뮤니티', icon: ChatIcon },
  { href: '/mypage', label: '마이', icon: UserIcon },
]

export default function BottomNav() {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-[1.7rem] border border-white/75 bg-white/82 px-2 py-2 shadow-[0_18px_50px_rgba(37,52,74,0.14)] backdrop-blur-xl">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const isPending = pendingHref === item.href && !isActive
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-busy={isPending}
              onClick={() => {
                if (!isActive) setPendingHref(item.href)
              }}
              className={cn(
                'relative flex min-h-12 min-w-[58px] flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 transition-colors active:scale-[0.98]',
                isActive || isPending
                  ? 'bg-[#EAF6F2] text-[#2F8F84]'
                  : 'text-[#9AA8BA] hover:bg-[#FFF7EF]'
              )}
            >
              {isPending ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#4FA99A] border-t-transparent" />
              ) : (
                <Icon className="h-5 w-5" />
              )}
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isActive || isPending ? 'text-[#2F8F84]' : 'text-[#9AA8BA]'
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GrowthIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 20V5m0 0h10M7 9h5M7 13h8M7 17h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function VaccineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m15 4 5 5M14 5l5 5-9.5 9.5-5-5zM7 17l-3 3m8-12 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 6.5A3.5 3.5 0 0 1 8.5 3h7A3.5 3.5 0 0 1 19 6.5v4A3.5 3.5 0 0 1 15.5 14H11l-5 4v-4.3a3.5 3.5 0 0 1-1-2.45z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
