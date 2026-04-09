import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type Variant = 'success' | 'error'

interface Toast {
  id: number
  message: string
  variant: Variant
}

interface ToastContextValue {
  toast: (message: string, variant?: Variant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counter = useRef(0)

  const toast = useCallback((message: string, variant: Variant = 'success') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl p-4 shadow-lg border text-sm font-medium animate-in slide-in-from-right-5',
              t.variant === 'success'
                ? 'bg-white border-green-200 text-green-800'
                : 'bg-white border-red-200 text-red-800'
            )}
          >
            {t.variant === 'success'
              ? <CheckCircle className="mt-0.5 shrink-0 text-green-500" size={16} />
              : <XCircle className="mt-0.5 shrink-0 text-red-500" size={16} />
            }
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
