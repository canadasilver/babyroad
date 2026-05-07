import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg'
}

export default function Card({
  className,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  const paddings = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
