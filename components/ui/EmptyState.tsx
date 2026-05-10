import AppCard from '@/components/ui/AppCard'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  className?: string
}

export default function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <AppCard
      variant="soft"
      className={cn('py-6 text-center shadow-none', className)}
    >
      <div className="mx-auto mb-3 h-2 w-12 rounded-full bg-[#CFE3D8]" />
      <p className="text-sm font-semibold text-[#25344A]">{title}</p>
      {description ? <p className="mt-1 text-sm text-[#6B7A90]">{description}</p> : null}
    </AppCard>
  )
}
