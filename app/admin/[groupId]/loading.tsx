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
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 animate-pulse">
            <div className="h-9 bg-dark-surface rounded w-1/4 mb-2"></div>
            <div className="h-5 bg-dark-surface rounded w-1/2"></div>
          </div>
          
          <div className="mb-4 animate-pulse">
            <div className="flex gap-2">
              <div className="h-10 bg-dark-surface rounded w-24"></div>
              <div className="h-10 bg-dark-surface rounded w-24"></div>
              <div className="h-10 bg-dark-surface rounded w-24"></div>
            </div>
          </div>
          
          <Card>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-dark-bg rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-10 bg-dark-bg rounded"></div>
                <div className="h-10 bg-dark-bg rounded"></div>
                <div className="h-10 bg-dark-bg rounded"></div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

