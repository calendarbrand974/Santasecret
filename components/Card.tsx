import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`card ${className}`}>
      {title && (
        <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      )}
      {children}
    </div>
  )
}

