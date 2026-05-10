'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname } from 'next/navigation'
import { type AnchorHTMLAttributes, type ReactNode, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type PendingLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    pendingLabel?: ReactNode
    spinner?: boolean
  }

export default function PendingLink({
  children,
  className,
  href,
  onClick,
  pendingLabel,
  spinner = false,
  ...props
}: PendingLinkProps) {
  const pathname = usePathname()
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setIsPending(false)
  }, [pathname])

  return (
    <Link
      href={href}
      prefetch
      aria-busy={isPending}
      onClick={(event) => {
        setIsPending(true)
        onClick?.(event)
      }}
      className={cn(
        'transition active:scale-[0.99]',
        isPending && 'pointer-events-none opacity-80',
        className
      )}
      {...props}
    >
      {isPending && spinner ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {isPending && pendingLabel ? pendingLabel : children}
    </Link>
  )
}
