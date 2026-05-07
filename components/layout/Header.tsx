import Link from 'next/link'

interface HeaderProps {
  title?: string
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <span className="text-base font-bold text-slate-900">
            {title ?? 'BabyRoad'}
          </span>
        </Link>
      </div>
    </header>
  )
}
