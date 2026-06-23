import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline' | 'dark' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'gold', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = { gold: 'bg-gold-500 hover:bg-gold-600 text-black', outline: 'border-2 border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-black bg-transparent', dark: 'bg-charcoal-800 hover:bg-charcoal-700 text-white border border-charcoal-700', danger: 'bg-red-700 hover:bg-red-600 text-white', ghost: 'text-gold-500 hover:bg-charcoal-800 bg-transparent' }
    const sizes = { sm: 'text-sm py-2 px-4', md: 'text-base py-3 px-6', lg: 'text-lg py-4 px-8' }
    return (
      <button ref={ref} className={cn('inline-flex items-center justify-center font-bold rounded transition-all duration-200 cursor-pointer disabled:opacity-50', variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
        {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Loading...</span> : children}
      </button>
    )
  }
)
Button.displayName = 'Button'
export default Button
