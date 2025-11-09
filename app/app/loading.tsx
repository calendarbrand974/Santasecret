import { CardSkeleton } from '@/components/LoadingSkeleton'
import { Card } from '@/components/Card'

export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <div className="bg-dark-surface border-b border-dark-border">
        <div className="container mx-auto px-4 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-bg rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-dark-bg rounded w-1/4"></div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-10 bg-dark-surface rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-dark-surface rounded w-1/2 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  )
}

