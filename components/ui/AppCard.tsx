import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface AppCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'soft' | 'hero'
}

const paddingClass = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
}

const variantClass = {
  default: 'border-[#E8EEE9] bg-white/85 shadow-[0_14px_38px_rgba(37,52,74,0.08)]',
  soft: 'border-white/70 bg-white/62 shadow-[0_12px_32px_rgba(79,169,154,0.10)] backdrop-blur',
  hero: 'border-white/60 bg-[linear-gradient(135deg,#EAF6F2_0%,#FFF3E9_55%,#FFFFFF_100%)] shadow-[0_18px_44px_rgba(79,169,154,0.16)]',
}

export default function AppCard({
  className,
  padding = 'md',
  variant = 'default',
  children,
  ...props
}: AppCardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.35rem] border',
        paddingClass[padding],
        variantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
