'use client'

import React, { useEffect, useState, createContext, useContext } from 'react'
import { Card } from './Card'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7)
    const toast: Toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Initialiser l'instance globale
  useEffect(() => {
    setToastInstance({ toasts, addToast, removeToast })
  }, [toasts])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[], removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast, onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const typeStyles = {
    success: 'bg-green-500/20 border-green-500 text-green-400',
    error: 'bg-accent/20 border-accent text-accent',
    warning: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    info: 'bg-primary/20 border-primary text-white',
  }

  return (
    <div
      className={`transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Card className={`min-w-[300px] max-w-md ${typeStyles[toast.type]}`}>
        <div className="flex items-start justify-between gap-4">
          <p className="flex-1">{toast.message}</p>
          <button
            onClick={onClose}
            className="text-current opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </Card>
    </div>
  )
}

// Hook global pour utiliser les toasts
let toastInstance: ToastContextType | null = null

export function setToastInstance(instance: ToastContextType) {
  toastInstance = instance
}

export function toast(message: string, type: ToastType = 'info', duration = 5000) {
  if (toastInstance) {
    toastInstance.addToast(message, type, duration)
  } else {
    console.warn('Toast instance not initialized')
  }
}

