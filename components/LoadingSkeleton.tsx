export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-dark-surface rounded w-3/4"></div>
      <div className="h-4 bg-dark-surface rounded"></div>
      <div className="h-4 bg-dark-surface rounded w-5/6"></div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-dark-bg rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-dark-bg rounded"></div>
        <div className="h-4 bg-dark-bg rounded w-5/6"></div>
        <div className="h-4 bg-dark-bg rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function WishlistSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-6 bg-dark-bg rounded w-1/2 mb-6"></div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-dark-bg rounded w-1/4"></div>
          <div className="h-32 bg-dark-bg rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-5 bg-dark-bg rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-20 bg-dark-bg rounded"></div>
            <div className="h-20 bg-dark-bg rounded"></div>
          </div>
          <div className="h-10 bg-dark-bg rounded w-1/4"></div>
        </div>
        <div className="h-10 bg-dark-bg rounded w-full"></div>
      </div>
    </div>
  )
}

