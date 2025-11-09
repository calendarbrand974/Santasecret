'use client'

import { Component, ReactNode } from 'react'
import { Button } from './Button'
import { Card } from './Card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
          <Card className="max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="text-6xl">😕</div>
              <h1 className="text-2xl font-bold text-accent">Une erreur est survenue</h1>
              <p className="text-gray-400">
                {this.state.error?.message || 'Quelque chose s\'est mal passé'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => {
                    this.setState({ hasError: false, error: null })
                    window.location.reload()
                  }}
                >
                  Recharger la page
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/'}
                >
                  Retour à l'accueil
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

