'use client'

interface WishlistItem {
  title: string
  link?: string
  note?: string
  priority?: number
  category?: string
  imageUrl?: string
  estimatedPrice?: number
  order?: number
}

interface WishlistDisplayProps {
  wishlist: {
    freeText?: string
    items?: WishlistItem[]
    updatedAt?: string
  }
}

export function WishlistDisplay({ wishlist }: WishlistDisplayProps) {
  const getImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    try {
      const urlObj = new URL(url)
      const isExternal = !urlObj.hostname.includes('localhost') && 
                         !urlObj.hostname.includes('127.0.0.1')
      if (isExternal) {
        return `/api/image-proxy?url=${encodeURIComponent(url)}`
      }
      return url
    } catch {
      return url
    }
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-4">🎁 Wishlist de votre Gâté secret</h3>
      
      {wishlist.freeText && (
        <div className="mb-6">
          <h4 className="font-semibold mb-2 text-white">Message :</h4>
          <p className="text-gray-300 whitespace-pre-wrap bg-dark-surface p-4 rounded">
            {wishlist.freeText}
          </p>
        </div>
      )}
      
      {wishlist.items && wishlist.items.length > 0 ? (
        <div>
          <h4 className="font-semibold mb-4 text-white">Articles souhaités :</h4>
          <div className="space-y-4">
            {wishlist.items
              .filter((item: WishlistItem) => item.title?.trim() !== '')
              .sort((a: WishlistItem, b: WishlistItem) => {
                if (a.priority && b.priority && a.priority !== b.priority) {
                  return b.priority - a.priority
                }
                return (a.order ?? 0) - (b.order ?? 0)
              })
              .map((item: WishlistItem, index: number) => (
                <div
                  key={index}
                  className="p-4 bg-dark-bg rounded border border-dark-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {item.imageUrl && (
                      <img
                        src={getImageUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded border border-dark-border flex-shrink-0"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement
                          if (img.src.includes('/api/image-proxy')) {
                            img.src = item.imageUrl || ''
                          } else {
                            img.style.display = 'none'
                          }
                        }}
                        loading="lazy"
                        crossOrigin="anonymous"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h5 className="font-medium text-white text-lg">{item.title}</h5>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.priority && (
                            <div className="text-yellow-400 text-sm">
                              {'⭐'.repeat(item.priority)}
                            </div>
                          )}
                          {item.estimatedPrice && (
                            <div className="text-white text-sm font-semibold">
                              {item.estimatedPrice.toFixed(2)}€
                            </div>
                          )}
                        </div>
                      </div>
                      {item.category && (
                        <div className="text-xs text-gray-500 mb-2">
                          <span className="bg-dark-surface px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                        </div>
                      )}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:underline text-sm inline-block mb-2"
                        >
                          🔗 Voir le lien →
                        </a>
                      )}
                      {item.note && (
                        <p className="text-sm text-gray-400 mt-2">{item.note}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">
          Aucun article dans la liste de souhaits pour le moment.
        </p>
      )}
      
      {wishlist.updatedAt && (
        <div className="mt-6 text-sm text-gray-400 text-center">
          Dernière mise à jour : {new Date(wishlist.updatedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  )
}

