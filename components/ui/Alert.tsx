import { cn } from '@/lib/utils'
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

interface AlertProps { type?: 'success' | 'error' | 'info' | 'warning'; title?: string; message: string; className?: string }

export default function Alert({ type = 'info', title, message, className }: AlertProps) {
  const styles = {
    success: { bg: 'bg-green-900/20 border-green-500/30 text-green-300', Icon: CheckCircle, iconColor: 'text-green-400' },
    error: { bg: 'bg-red-900/20 border-red-500/30 text-red-300', Icon: AlertCircle, iconColor: 'text-red-400' },
    info: { bg: 'bg-blue-900/20 border-blue-500/30 text-blue-300', Icon: Info, iconColor: 'text-blue-400' },
    warning: { bg: 'bg-orange-900/20 border-orange-500/30 text-orange-300', Icon: AlertTriangle, iconColor: 'text-orange-400' },
  }
  const { bg, Icon, iconColor } = styles[type]
  return (
    <div className={cn('border rounded-lg p-4 flex gap-3', bg, className)}>
      <Icon className={cn('shrink-0 mt-0.5', iconColor)} size={20} />
      <div>{title && <p className="font-semibold mb-1">{title}</p>}<p className="text-sm">{message}</p></div>
    </div>
  )
}
