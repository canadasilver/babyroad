'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BabyRoadLogo from '@/components/brand/BabyRoadLogo'

interface HeaderProps {
  title?: string
  showBack?: boolean
}

export default function Header({ title, showBack }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-[#FFFDF8]/82 px-4 py-3 shadow-[0_10px_30px_rgba(37,52,74,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex min-h-11 items-center gap-2 rounded-2xl pr-3 text-[#6B7A90]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-lg text-[#4FA99A] shadow-sm">
              ←
            </span>
            <span className="text-base font-bold text-[#25344A]">{title ?? 'BabyRoad'}</span>
          </button>
        ) : (
          <Link href="/dashboard" className="flex min-h-11 items-center">
            {title === 'BabyRoad' || !title ? (
              <BabyRoadLogo size="sm" />
            ) : (
              <div className="flex items-center gap-2">
                <BabyRoadLogo size="sm" showText={false} />
                <span className="text-base font-bold text-[#25344A]">{title}</span>
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  )
}
