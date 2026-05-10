import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  withBottomNavPadding?: boolean
  centered?: boolean
}

export default function AppShell({
  children,
  className,
  contentClassName,
  withBottomNavPadding = false,
  centered = false,
}: AppShellProps) {
  return (
    <main
      className={cn(
        'min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(246,176,146,0.22),transparent_34%),linear-gradient(180deg,#FFF9F3_0%,#FFFDF8_48%,#EAF6F2_100%)] px-4 py-6 text-[#1F2D3D]',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-md',
          centered && 'flex min-h-[calc(100vh-3rem)] flex-col justify-center',
          withBottomNavPadding && 'pb-28',
          contentClassName
        )}
      >
        {children}
      </div>
    </main>
  )
}
