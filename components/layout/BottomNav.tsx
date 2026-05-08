'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '홈', icon: '🏠' },
  { href: '/growth', label: '성장', icon: '📏' },
  { href: '/vaccinations', label: '예방접종', icon: '💉' },
  { href: '/community', label: '커뮤니티', icon: '💬' },
  { href: '/mypage', label: '마이', icon: '👤' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-3 py-2',
                isActive ? 'text-orange-500' : 'text-slate-400'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isActive ? 'text-orange-500' : 'text-slate-400'
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
