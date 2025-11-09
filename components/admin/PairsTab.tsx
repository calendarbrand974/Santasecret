'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '../Card'
import { Button } from '../Button'
import { Modal } from '../Modal'
import { useToast } from '../Toast'

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

interface Wishlist {
  freeText: string
  items: WishlistItem[]
  itemsCount: number
  totalBudget: number
  updatedAt: string | null
}

interface Assignment {
  id: string
  giverId: string
  giverName: string
  receiverId: string
  receiverName: string
  revealedAt: string | null
  receiverWishlist: Wishlist | null
}

interface PairsTabProps {
  groupId: string
}

export function PairsTab({ groupId }: PairsTabProps) {
  const router = useRouter()
  const toast = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [rematching, setRematching] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [selectedGivers, setSelectedGivers] = useState<Set<string>>(new Set())
  const [selectedReceiver, setSelectedReceiver] = useState<Assignment | null>(null)
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false)
  
  useEffect(() => {
    loadAssignments()
  }, [groupId])
  
  // Recharger quand on revient sur l'onglet (détection via visibilitychange)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[PAIRS TAB] Page visible, rechargement des assignations...')
        // Attendre un peu pour éviter les timeouts
        setTimeout(() => {
          loadAssignments(true)
        }, 500)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [groupId])
  
  // Ajouter un listener pour détecter les changements de focus (quand l'utilisateur revient sur l'onglet)
  // Désactivé pour éviter les timeouts de connexion
  // useEffect(() => {
  //   const handleFocus = () => {
  //     console.log('[PAIRS TAB] Fenêtre refocusée, rechargement des assignations...')
  //     loadAssignments(true)
  //   }
  //   
  //   window.addEventListener('focus', handleFocus)
  //   return () => window.removeEventListener('focus', handleFocus)
  // }, [groupId])
  
  const loadAssignments = async (forceRefresh: boolean = false) => {
    try {
      // Ajouter un timestamp pour éviter le cache si on force le rafraîchissement
      const url = forceRefresh 
        ? `/api/admin/groups/${groupId}/assignments?t=${Date.now()}`
        : `/api/admin/groups/${groupId}/assignments`
      
      const res = await fetch(url, {
        cache: forceRefresh ? 'no-store' : 'default',
        headers: {
          'Cache-Control': forceRefresh ? 'no-cache' : 'default',
        },
        })
      
      if (!res.ok) {
        throw new Error(`Erreur ${res.status}: ${res.statusText}`)
      }
      
      const data = await res.json()
      console.log('[PAIRS TAB] Assignations chargées:', data.assignments?.length || 0, 'paires')
      setAssignments(data.assignments || [])
      setLoading(false)
    } catch (err) {
      console.error('Erreur lors du chargement des assignations:', err)
      setLoading(false)
      // Ne pas afficher d'erreur toast ici, c'est géré dans handleTriggerDraw
    }
  }
  
  const handleDelete = async (giverId: string) => {
    if (!confirm('Supprimer cette paire ?')) return
    
    try {
      const response = await fetch(`/api/admin/groups/${groupId}/assignments/${giverId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression')
      }
      
      loadAssignments()
      toast.addToast('Paire supprimée avec succès', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de la suppression', 'error')
    }
  }
  
  const handleTriggerDraw = async () => {
    if (!confirm('Déclencher le tirage au sort maintenant ? Cette action créera les paires pour tous les membres.')) {
      return
    }
    
    setTriggering(true)
    try {
      console.log('Déclenchement du tirage...', { groupId })
      
      // Créer un AbortController pour gérer le timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 secondes max
      
      let res
      try {
        res = await fetch(`/api/admin/groups/${groupId}/draw/trigger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError') {
          throw new Error('La requête a pris trop de temps (timeout après 30 secondes)')
        }
        throw fetchError
      }
      
      console.log('Réponse reçue:', { status: res.status, statusText: res.statusText, ok: res.ok })
      
      let data
      try {
        data = await res.json()
        console.log('Données JSON:', data)
      } catch (jsonError) {
        console.error('Erreur parsing JSON:', jsonError)
        const text = await res.text()
        console.error('Réponse texte:', text)
        throw new Error('Réponse invalide du serveur')
      }
      
      if (!res.ok) {
        console.error('Erreur API:', data)
        throw new Error(data.error || `Erreur ${res.status}: ${res.statusText}`)
      }
      
      console.log('Tirage déclenché avec succès:', data)
      
      // Attendre un peu avant de recharger pour éviter les timeouts de connexion
      toast.addToast(`Tirage au sort déclenché ! ${data.assignmentsCount} paire(s) créée(s).`, 'success')
      
      // Réinitialiser l'état de chargement pour forcer un re-render
      setLoading(true)
      setAssignments([]) // Vider la liste immédiatement
      
      // Attendre 2 secondes avant de recharger pour laisser le temps aux connexions de se libérer
      // Avec connection_limit: 1, il faut attendre que toutes les opérations précédentes soient terminées
      setTimeout(async () => {
        try {
          console.log('[PAIRS TAB] Rechargement des assignations après tirage...')
          // Recharger les assignations (sans router.refresh pour éviter les requêtes parallèles)
          await loadAssignments(true) // Force refresh
          console.log('[PAIRS TAB] Assignations rechargées avec succès')
        } catch (err) {
          console.error('[PAIRS TAB] Erreur lors du rechargement, nouvelle tentative...', err)
          // Retry après un délai supplémentaire (3 secondes pour être sûr)
          setTimeout(async () => {
            console.log('[PAIRS TAB] Nouvelle tentative de rechargement...')
            try {
              await loadAssignments(true) // Force refresh
              console.log('[PAIRS TAB] Assignations rechargées après retry')
            } catch (retryErr) {
              console.error('[PAIRS TAB] Erreur lors du retry:', retryErr)
              toast.addToast('Erreur lors du rechargement. Veuillez actualiser la page.', 'error')
            }
          }, 3000)
        }
      }, 2000)
    } catch (err: any) {
      console.error('Erreur lors du déclenchement:', err)
      toast.addToast(err.message || 'Erreur lors du déclenchement du tirage', 'error')
    } finally {
      setTriggering(false)
      console.log('Déclenchement terminé, triggering = false')
    }
  }
  
  const handleRematch = async () => {
    if (selectedGivers.size === 0) {
      toast.addToast('Sélectionnez au moins un donneur', 'error')
      return
    }
    
    if (!confirm(`Ré-appairer ${selectedGivers.size} donneur(s) ?`)) return
    
    setRematching(true)
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/assignments/rematch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ givers: Array.from(selectedGivers) }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur')
      }
      
      setSelectedGivers(new Set())
      loadAssignments()
      toast.addToast('Ré-appairage réussi !', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors du ré-appairage', 'error')
    } finally {
      setRematching(false)
    }
  }
  
  const toggleGiver = (giverId: string) => {
    const newSet = new Set(selectedGivers)
    if (newSet.has(giverId)) {
      newSet.delete(giverId)
    } else {
      newSet.add(giverId)
    }
    setSelectedGivers(newSet)
  }
  
  const handleViewWishlist = (assignment: Assignment) => {
    setSelectedReceiver(assignment)
    setIsWishlistModalOpen(true)
  }
  
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
  
  const revealedCount = assignments.filter(a => a.revealedAt).length
  const totalCount = assignments.length
  const revealedPercentage = totalCount > 0 ? Math.round((revealedCount / totalCount) * 100) : 0
  
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-bg rounded w-1/4"></div>
          <div className="h-10 bg-dark-bg rounded"></div>
          <div className="h-10 bg-dark-bg rounded"></div>
        </div>
      </Card>
    )
  }
  
  const hasDraw = assignments.length > 0
  
  return (
    <>
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {hasDraw ? 'Recréer le tirage au sort' : 'Tester le tirage au sort'}
            </h3>
            <p className="text-sm text-gray-400">
              {hasDraw 
                ? 'Déclenchez un nouveau tirage. L\'ancien tirage et ses paires seront supprimés automatiquement.'
                : 'Déclenchez manuellement le tirage au sort pour tester le système avant la date d\'ouverture'
              }
            </p>
          </div>
          <Button onClick={handleTriggerDraw} disabled={triggering}>
            {triggering ? 'Déclenchement...' : hasDraw ? 'Recréer le tirage' : 'Déclencher le tirage'}
          </Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-1">{totalCount}</div>
            <div className="text-sm text-gray-400">Paires totales</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">{revealedCount}</div>
            <div className="text-sm text-gray-400">Révélations</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-1">{revealedPercentage}%</div>
            <div className="text-sm text-gray-400">Taux de révélation</div>
          </div>
        </Card>
      </div>
      
      {selectedGivers.size > 0 && (
        <Card>
          <div className="flex justify-between items-center">
            <span>{selectedGivers.size} donneur(s) sélectionné(s)</span>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSelectedGivers(new Set())}>
                ❌ Annuler
              </Button>
              <Button onClick={handleRematch} disabled={rematching}>
                {rematching ? '⏳ Ré-appairage...' : <>🔄 Ré-appairer</>}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGivers(new Set(assignments.map(a => a.giverId)))
                      } else {
                        setSelectedGivers(new Set())
                      }
                    }}
                  />
                </th>
                <th className="text-left p-3">Donneur</th>
                <th className="text-left p-3">→</th>
                <th className="text-left p-3">Receveur</th>
                <th className="text-left p-3">Révélé</th>
                <th className="text-left p-3">Wishlist</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.id} className="border-b border-dark-border hover:bg-dark-surface/50 transition-colors">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedGivers.has(assignment.giverId)}
                      onChange={() => toggleGiver(assignment.giverId)}
                    />
                  </td>
                  <td className="p-3 font-medium">{assignment.giverName}</td>
                  <td className="p-3 text-primary">→</td>
                  <td className="p-3 font-medium">{assignment.receiverName}</td>
                  <td className="p-3">
                    {assignment.revealedAt ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    {assignment.receiverWishlist ? (
                      <div className="text-sm">
                        <div className="text-gray-300">
                          {assignment.receiverWishlist.itemsCount} article{assignment.receiverWishlist.itemsCount > 1 ? 's' : ''}
                        </div>
                        {assignment.receiverWishlist.totalBudget > 0 && (
                          <div className="text-gray-400 text-xs">
                            {assignment.receiverWishlist.totalBudget.toFixed(2)}€
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      {assignment.receiverWishlist && (
                        <Button
                          variant="secondary"
                          onClick={() => handleViewWishlist(assignment)}
                          className="text-xs px-3 py-1"
                        >
                          Voir wishlist
                        </Button>
                      )}
                      <button
                        onClick={() => handleDelete(assignment.giverId)}
                        className="text-red-400 hover:text-red-300 text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {selectedReceiver && (
        <Modal
          isOpen={isWishlistModalOpen}
          onClose={() => setIsWishlistModalOpen(false)}
          title={`Wishlist de ${selectedReceiver.receiverName}`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {selectedReceiver.receiverWishlist?.freeText && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Message libre</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{selectedReceiver.receiverWishlist.freeText}</p>
              </div>
            )}
            
            {selectedReceiver.receiverWishlist && selectedReceiver.receiverWishlist.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Articles ({selectedReceiver.receiverWishlist.itemsCount})
                </h3>
                <div className="space-y-3">
                  {selectedReceiver.receiverWishlist.items
                    .filter((item: WishlistItem) => item.title?.trim() !== '')
                    .sort((a: WishlistItem, b: WishlistItem) => {
                      if (a.priority && b.priority && a.priority !== b.priority) {
                        return b.priority - a.priority
                      }
                      return (a.order ?? 0) - (b.order ?? 0)
                    })
                    .map((item: WishlistItem, idx: number) => (
                      <div key={idx} className="border border-dark-border rounded-lg p-3 bg-dark-surface">
                        <div className="flex gap-3">
                          {item.imageUrl && (
                            <img
                              src={getImageUrl(item.imageUrl)}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-white">{item.title}</h4>
                              {item.priority && (
                                <span className="text-yellow-400 text-sm">
                                  {'★'.repeat(item.priority)}
                                </span>
                              )}
                            </div>
                            {item.category && (
                              <div className="text-xs text-gray-400 mt-1">
                                {item.category}
                              </div>
                            )}
                            {item.note && (
                              <p className="text-sm text-gray-400 mt-1">{item.note}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                              {item.estimatedPrice && (
                                <span>{item.estimatedPrice.toFixed(2)}€</span>
                              )}
                              {item.link && (
                                <a
                                  href={item.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  Voir le lien →
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            
            {(!selectedReceiver.receiverWishlist || selectedReceiver.receiverWishlist.itemsCount === 0) && !selectedReceiver.receiverWishlist?.freeText && (
              <p className="text-gray-400 text-center py-8">Aucun article dans la wishlist</p>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
