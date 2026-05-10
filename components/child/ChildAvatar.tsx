'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type ChildAvatarProps = {
  photoUrl: string | null
  gender: string
  status: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE = {
  sm: { wh: 'h-10 w-10', text: 'text-lg', imgSizes: '40px' },
  md: { wh: 'h-14 w-14', text: 'text-2xl', imgSizes: '56px' },
  lg: { wh: 'h-20 w-20', text: 'text-3xl', imgSizes: '80px' },
}

const ICON: Record<string, string> = {
  pregnancy: '🤰',
  male: '👦',
  female: '👧',
  unknown: '👶',
}

export default function ChildAvatar({
  photoUrl,
  gender,
  status,
  size = 'md',
  className,
}: ChildAvatarProps) {
  const [imgError, setImgError] = useState(false)

  const { wh, text, imgSizes } = SIZE[size]
  const icon = status === 'pregnancy' ? ICON.pregnancy : (ICON[gender] ?? ICON.unknown)
  const baseClass = cn('relative flex shrink-0 items-center justify-center overflow-hidden rounded-full', wh, className)

  if (photoUrl && !imgError) {
    return (
      <div className={baseClass}>
        <Image
          src={photoUrl}
          alt="아이 프로필"
          fill
          sizes={imgSizes}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  return (
    <div className={cn(baseClass, text)}>
      {icon}
    </div>
  )
}
