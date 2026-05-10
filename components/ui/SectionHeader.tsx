import Link from 'next/link'

interface SectionHeaderProps {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export default function SectionHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-bold text-[#1F2D3D]">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-[#6B7A90]">{description}</p>
        ) : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="shrink-0 rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#D77C5B]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}
