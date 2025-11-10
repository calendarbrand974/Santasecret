import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block mb-2 text-sm font-medium text-white">
          {label}
        </label>
      )}
      <input
        className={`input ${error ? 'border-accent' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-accent">{error}</p>
      )}
    </div>
  )
}

