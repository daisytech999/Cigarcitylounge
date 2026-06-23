import { cn } from '@/lib/utils'

export default function LoadingSpinner({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' }
  return <div className={cn('flex items-center justify-center', className)}><div className={cn('animate-spin rounded-full border-2 border-charcoal-700 border-t-gold-500', sizes[size])} /></div>
}
