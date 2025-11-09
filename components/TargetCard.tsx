import { Card } from './Card'

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

interface TargetCardProps {
  target: {
    name: string
    wishlist?: {
      freeText?: string
      items?: WishlistItem[]
      updatedAt?: string
    }
  }
}

export function TargetCard({ target }: TargetCardProps) {
  const { name, wishlist } = target
  const updatedAt = wishlist?.updatedAt ? new Date(wishlist.updatedAt) : null
  
  // Fonction pour obtenir l'URL de l'image via le proxy si nécessaire
  const getImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    // Utiliser le proxy pour toutes les images externes pour éviter les problèmes CORS
    try {
      const urlObj = new URL(url)
      // Si c'est une URL externe (pas localhost ni 127.0.0.1), utiliser le proxy
      const isExternal = !urlObj.hostname.includes('localhost') && 
                         !urlObj.hostname.includes('127.0.0.1')
      if (isExternal) {
        return `/api/image-proxy?url=${encodeURIComponent(url)}`
      }
      return url
    } catch {
      // En cas d'erreur de parsing, utiliser le proxy par sécurité
      return `/api/image-proxy?url=${encodeURIComponent(url)}`
    }
  }
  
  return (
    <Card>
      <div className="text-center space-y-4">
        <div className="text-3xl mb-4">🎁</div>
        <h2 className="text-2xl font-bold text-primary">
          Votre Gâté secret est : {name}
        </h2>
        
        <div className="mt-6 text-left">
          {wishlist ? (
            <>
              {wishlist.freeText && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Message :</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{wishlist.freeText}</p>
                </div>
              )}
              
              {wishlist.items && wishlist.items.length > 0 ? (
                <div>
                  <h3 className="font-semibold mb-2">Articles souhaités :</h3>
                  <ul className="space-y-3">
                    {wishlist.items
                      .filter((item: WishlistItem) => item.title?.trim() !== '')
                      .sort((a: WishlistItem, b: WishlistItem) => {
                        // Trier par priorité puis par order
                        if (a.priority && b.priority && a.priority !== b.priority) {
                          return b.priority - a.priority
                        }
                        return (a.order ?? 0) - (b.order ?? 0)
                      })
                      .map((item, index) => (
                      <li key={index} className="p-4 bg-dark-bg rounded border border-dark-border">
                        <div className="flex items-start gap-3">
                          {item.imageUrl && (
                            <img
                              src={getImageUrl(item.imageUrl)}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded border border-dark-border flex-shrink-0"
                              onError={(e) => {
                                // Essayer l'URL directe si le proxy échoue
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
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="font-medium flex-1">{item.title}</div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {item.priority && (
                                  <div className="text-yellow-400 text-sm">
                                    {'★'.repeat(item.priority)}
                                  </div>
                                )}
                                {item.estimatedPrice && (
                                  <div className="text-primary text-sm font-semibold">
                                    {item.estimatedPrice.toFixed(2)}€
                                  </div>
                                )}
                              </div>
                            </div>
                            {item.category && (
                              <div className="text-xs text-gray-500 mb-1">
                                {item.category}
                              </div>
                            )}
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm inline-block mb-1"
                              >
                                Voir le lien →
                              </a>
                            )}
                            {item.note && (
                              <div className="text-sm text-gray-400 mt-1">{item.note}</div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-lg">
                    {name} n'a aucun souhait pour le moment.
                  </p>
                </div>
              )}
              
              {updatedAt && (
                <div className="mt-4 text-sm text-gray-400">
                  Dernière mise à jour : {updatedAt.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 text-lg">
                {name} n'a aucun souhait pour le moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

