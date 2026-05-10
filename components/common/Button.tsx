'use client'

import { cn } from '@/lib/utils'
import { type ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex min-h-12 items-center justify-center rounded-2xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#4FA99A]/25 disabled:cursor-not-allowed disabled:opacity-50'

    const variants = {
      primary:
        'bg-[#4FA99A] text-white shadow-[0_12px_26px_rgba(79,169,154,0.25)] hover:bg-[#428F84] active:bg-[#367C73]',
      secondary: 'bg-[#EAF6F2] text-[#2F766E] hover:bg-[#DDEFE9]',
      outline: 'border border-[#D9E6DF] bg-white/78 text-[#25344A] hover:border-[#4FA99A]',
      ghost: 'text-[#6B7A90] hover:bg-white/60',
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-sm',
      lg: 'px-5 py-3.5 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
