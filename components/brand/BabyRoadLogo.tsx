import { cn } from '@/lib/utils'

interface BabyRoadLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  align?: 'left' | 'center'
  className?: string
}

const sizeMap = {
  sm: {
    wrap: 'gap-2',
    mark: 'h-8 w-8',
    text: 'text-lg',
    sub: 'text-[10px]',
  },
  md: {
    wrap: 'gap-3',
    mark: 'h-12 w-12',
    text: 'text-2xl',
    sub: 'text-xs',
  },
  lg: {
    wrap: 'gap-4',
    mark: 'h-20 w-20',
    text: 'text-5xl',
    sub: 'text-sm',
  },
}

export function BabyRoadSymbol({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={cn('drop-shadow-[0_10px_22px_rgba(79,169,154,0.18)]', className)}
      role="img"
      aria-label="BabyRoad logo"
    >
      <path
        d="M68 31c-4.5-14.2-20.8-19-33.5-11.8-11.7 6.7-16 22.8-8.5 34.1"
        fill="none"
        stroke="#F6B092"
        strokeLinecap="round"
        strokeWidth="6"
      />
      <path
        d="M34 35c2-6.2 7.7-10.3 14.2-10.3 9 0 16.2 7.3 16.2 16.2v5.8"
        fill="none"
        stroke="#F6B092"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M53.4 39.8h.1M58.6 49.5c-3.5 2.5-7.5 2.6-11.4.3"
        fill="none"
        stroke="#F6B092"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M18 59c12-8.6 30.2-14.8 55-11.8-17.4 7.5-36.4 15.8-55 11.8Z"
        fill="#EAF6F2"
        stroke="#4FA99A"
        strokeLinejoin="round"
        strokeWidth="6"
      />
      <path
        d="M27 68c8 4.7 18.4 4.7 30.5 0"
        fill="none"
        stroke="#4FA99A"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M67 68c0-10 6.5-18.4 16.5-20-1 10.4-7.5 17.8-16.5 20Z"
        fill="#4FA99A"
      />
      <path
        d="M66.5 76c2.5-10.2 8.8-18.5 17-25"
        fill="none"
        stroke="#2F8F84"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  )
}

export default function BabyRoadLogo({
  size = 'md',
  showText = true,
  align = 'left',
  className,
}: BabyRoadLogoProps) {
  const style = sizeMap[size]

  return (
    <div
      className={cn(
        'flex items-center',
        align === 'center' ? 'justify-center text-center' : 'justify-start',
        style.wrap,
        className
      )}
    >
      <BabyRoadSymbol className={style.mark} />
      {showText ? (
        <div>
          <p className={cn('font-black tracking-normal leading-none', style.text)}>
            <span className="text-[#25344A]">Baby</span>
            <span className="text-[#4FA99A]">Road</span>
          </p>
          <p className={cn('mt-1 font-medium tracking-[0.18em] text-[#8FA0B5]', style.sub)}>
            BABY GROWTH JOURNEY
          </p>
        </div>
      ) : null}
    </div>
  )
}
