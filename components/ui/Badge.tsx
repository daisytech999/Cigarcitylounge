import { cn } from '@/lib/utils'

interface BadgeProps { children: React.ReactNode; variant?: 'gold' | 'green' | 'red' | 'blue' | 'gray' | 'orange'; className?: string }

export default function Badge({ children, variant = 'gold', className }: BadgeProps) {
  const variants = {
    gold: 'bg-gold-500/20 text-gold-400 border-gold-500/30',
    green: 'bg-green-900/30 text-green-400 border-green-500/30',
    red: 'bg-red-900/30 text-red-400 border-red-500/30',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-500/30',
    gray: 'bg-charcoal-800 text-charcoal-300 border-charcoal-700',
    orange: 'bg-orange-900/30 text-orange-400 border-orange-500/30',
  }
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border', variants[variant], className)}>{children}</span>
}
