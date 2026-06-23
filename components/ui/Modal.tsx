'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className={cn('relative bg-charcoal-900 border border-charcoal-700 rounded-lg w-full shadow-xl max-h-[90vh] overflow-y-auto', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-charcoal-700">
            <h2 className="text-xl font-serif text-gold-500">{title}</h2>
            <button onClick={onClose} className="text-charcoal-400 hover:text-white p-1"><X size={24} /></button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}
