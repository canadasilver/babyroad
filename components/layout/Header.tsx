'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export default function Header({ title, showBack }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-slate-600"
          >
            <span className="text-lg">←</span>
            <span className="text-base font-bold text-slate-900">{title ?? 'BabyRoad'}</span>
          </button>
        ) : (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <span className="text-base font-bold text-slate-900">{title ?? 'BabyRoad'}</span>
          </Link>
        )}
      </div>
    </header>
  )
}
