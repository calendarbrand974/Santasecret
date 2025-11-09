'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from './Button'
import { Input } from './Input'
import { Card } from './Card'
import { Modal } from './Modal'
import { useToast } from './Toast'
import { WISHLIST_CATEGORIES } from '@/lib/metadata-extractor'

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

interface WishlistEditorProps {
  initialFreeText?: string
  initialItems?: WishlistItem[]
  groupId: string
}

export function WishlistEditor({ initialFreeText = '', initialItems = [], groupId }: WishlistEditorProps) {
  const toast = useToast()
  const router = useRouter()
  const [freeText, setFreeText] = useState(initialFreeText)
  const [items, setItems] = useState<WishlistItem[]>(initialItems.map((item, idx) => ({ ...item, order: item.order ?? idx })))
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [modalItem, setModalItem] = useState<WishlistItem>({ title: '' })
  
  // Upload state
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  useEffect(() => {
    setFreeText(initialFreeText)
    setItems(initialItems.map((item, idx) => ({ ...item, order: item.order ?? idx })))
    setIsDirty(false)
  }, [initialFreeText, initialItems])
  
  // Auto-save après 3 secondes d'inactivité
  useEffect(() => {
    if (!isDirty) return
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      handleAutoSave()
    }, 3000)
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [freeText, items, isDirty])
  
  const handleAutoSave = useCallback(async () => {
    if (!isDirty) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/wishlist/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freeText, 
          items: items.filter(item => item.title.trim() !== '').map((item, idx) => ({ ...item, order: idx }))
        }),
      })
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }
      setLastSaved(new Date())
      setIsDirty(false)
    } catch (error: any) {
      console.error('Auto-save error:', error)
    } finally {
      setSaving(false)
    }
  }, [freeText, items, isDirty, groupId])
  
  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/wishlist/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freeText, 
          items: items.filter(item => item.title.trim() !== '').map((item, idx) => ({ ...item, order: idx }))
        }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }
      setLastSaved(new Date())
      setIsDirty(false)
      toast.addToast('Liste de souhaits enregistrée avec succès !', 'success')
    } catch (error: any) {
      toast.addToast(error.message || 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const openAddModal = () => {
    setModalItem({ title: '' })
    setEditingIndex(null)
    setIsModalOpen(true)
  }
  
  const openEditModal = (index: number) => {
    setModalItem({ ...items[index] })
    setEditingIndex(index)
    setIsModalOpen(true)
  }
  
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingIndex(null)
    setModalItem({ title: '' })
  }
  
  const saveModalItem = async () => {
    if (!modalItem.title.trim()) {
      toast.addToast('Le titre est requis', 'error')
      return
    }
    
    let updatedItems: WishlistItem[]
    
    if (editingIndex !== null) {
      // Modifier un item existant
      updatedItems = [...items]
      updatedItems[editingIndex] = { ...modalItem }
    } else {
      // Ajouter un nouvel item
      const newOrder = items.length > 0 ? Math.max(...items.map(i => i.order ?? 0)) + 1 : 0
      updatedItems = [...items, { ...modalItem, order: newOrder }]
    }
    
    setItems(updatedItems)
    setIsDirty(true)
    closeModal()
    
    // Forcer la sauvegarde immédiate et rafraîchir pour afficher l'image
    try {
      await fetch(`/api/groups/${groupId}/wishlist/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          freeText, 
          items: updatedItems.filter(item => item.title.trim() !== '').map((item, idx) => ({ ...item, order: idx }))
        }),
      })
      
      // Rafraîchir la page pour afficher l'image
      router.refresh()
    } catch (error) {
      console.error('Error saving item:', error)
    }
  }
  
  const removeItem = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      setItems(items.filter((_, i) => i !== index))
      setIsDirty(true)
    }
  }
  
  const handleLinkChange = async (link: string) => {
    setModalItem({ ...modalItem, link })
    
    // Essayer d'extraire les métadonnées si c'est une URL valide
    if (link && link.startsWith('http')) {
      try {
        const response = await fetch('/api/wishlist/extract-metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: link }),
        })
        
        if (response.ok) {
          const { metadata } = await response.json()
          if (metadata) {
            const updatedItem = { ...modalItem, link }
            if (metadata.title && !updatedItem.title) {
              updatedItem.title = metadata.title
            }
            if (metadata.imageUrl) {
              updatedItem.imageUrl = metadata.imageUrl
            }
            if (metadata.price) {
              updatedItem.estimatedPrice = metadata.price
            }
            setModalItem(updatedItem)
          }
        }
      } catch (error) {
        // Ignorer les erreurs d'extraction
        console.error('Metadata extraction error:', error)
      }
    }
  }
  
  // Trier les items par priorité puis par order pour l'affichage
  const sortedItems = [...items].sort((a, b) => {
    if (a.priority && b.priority && a.priority !== b.priority) {
      return b.priority - a.priority
    }
    return (a.order ?? 0) - (b.order ?? 0)
  })
  
  // Filtrer après le tri pour l'affichage
  const filteredItems = selectedCategory === 'all' 
    ? sortedItems.filter(item => item.title.trim() !== '')
    : sortedItems.filter(item => item.title.trim() !== '' && item.category === selectedCategory)
  
  const totalBudget = items.reduce((sum, item) => sum + (item.estimatedPrice || 0), 0)
  const itemsCount = items.filter(item => item.title.trim() !== '').length
  
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
  
  // Fonction pour extraire le nom de domaine d'une URL
  const getDomainFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      let domain = urlObj.hostname.replace('www.', '')
      // Raccourcir les domaines longs
      if (domain.length > 30) {
        domain = domain.substring(0, 27) + '...'
      }
      return domain
    } catch {
      return url.length > 30 ? url.substring(0, 27) + '...' : url
    }
  }
  
  // Fonction pour uploader une image
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.addToast('Veuillez sélectionner une image', 'error')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.addToast('L\'image est trop volumineuse (max 5 MB)', 'error')
      return
    }
    
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'upload')
      }
      
      const data = await response.json()
      setModalItem({ ...modalItem, imageUrl: data.url })
      toast.addToast('Image uploadée avec succès !', 'success')
    } catch (error: any) {
      toast.addToast(error.message || 'Erreur lors de l\'upload de l\'image', 'error')
    } finally {
      setUploadingImage(false)
    }
  }
  
  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  // Icône crayon SVG
  const EditIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
      />
    </svg>
  )
  
  // Icône corbeille SVG
  const DeleteIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className="h-5 w-5" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
      />
    </svg>
  )
  
  // Fonction pour supprimer avec confirmation
  const handleDeleteItem = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      removeItem(index)
      toast.addToast('Article supprimé', 'success')
    }
  }
  
  return (
    <>
      <Card>
        <div className="space-y-6">
          {/* Indicateur de sauvegarde */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {saving ? (
                <span className="text-gray-400">Enregistrement...</span>
              ) : lastSaved ? (
                <span className="text-green-400">✓ Enregistré {lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
              ) : isDirty ? (
                <span className="text-yellow-400">Modifications non enregistrées</span>
              ) : null}
            </div>
            {itemsCount > 0 && (
              <div className="text-gray-400">
                {itemsCount} article{itemsCount > 1 ? 's' : ''}
                {totalBudget > 0 && ` • Budget total: ${totalBudget.toFixed(2)}€`}
              </div>
            )}
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Message libre
            </label>
            <textarea
              className="input min-h-[150px] resize-y"
              value={freeText}
              onChange={(e) => {
                setFreeText(e.target.value)
                setIsDirty(true)
              }}
              placeholder="Écrivez votre lettre au Père Noël..."
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-300">
                Articles souhaités
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input text-sm"
                >
                  <option value="all">Toutes les catégories</option>
                  {WISHLIST_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <Button variant="secondary" onClick={openAddModal} className="text-sm">
                  + Ajouter
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredItems.map((item, displayIndex) => {
                // Trouver l'index original dans le tableau items (non trié)
                const originalIndex = items.findIndex((i, idx) => {
                  return i === item || (
                    i.title === item.title && 
                    i.link === item.link &&
                    items.indexOf(i) === idx
                  )
                })
                
                if (originalIndex === -1) return null
                
                return (
                  <div
                    key={`${originalIndex}-${item.title}`}
                    className="p-4 bg-dark-bg rounded border border-dark-border hover:border-primary transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      {item.imageUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.title}
                            className="w-20 h-20 object-cover rounded border border-dark-border"
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
                        </div>
                      )}
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                            {item.category && (
                              <span className="inline-block px-2 py-1 text-xs bg-primary/20 text-primary rounded mb-2">
                                {item.category}
                              </span>
                            )}
                            {item.estimatedPrice && (
                              <div className="text-sm text-gray-400 mt-1">
                                {item.estimatedPrice.toFixed(2)}€
                              </div>
                            )}
                            {item.priority && (
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <span
                                    key={star}
                                    className={`text-sm ${item.priority && item.priority >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.note && (
                              <p className="text-sm text-gray-400 mt-2 line-clamp-2">{item.note}</p>
                            )}
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded text-sm text-primary transition-colors group"
                              >
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-4 w-4" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                  />
                                </svg>
                                <span className="font-medium">{getDomainFromUrl(item.link)}</span>
                                <svg 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" 
                                  fill="none" 
                                  viewBox="0 0 24 24" 
                                  stroke="currentColor"
                                >
                                  <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M9 5l7 7-7 7" 
                                  />
                                </svg>
                              </a>
                            )}
                          </div>
                          
                          {/* Boutons d'action */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(originalIndex)}
                              className="flex-shrink-0 p-2 text-gray-400 hover:text-primary hover:bg-dark-surface rounded transition-colors"
                              title="Modifier"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(originalIndex)}
                              className="flex-shrink-0 p-2 text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded transition-colors"
                              title="Supprimer"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>
                    {items.length === 0 
                      ? 'Aucun article. Cliquez sur "+ Ajouter" pour commencer.'
                      : 'Aucun article dans cette catégorie.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? '⏳ Enregistrement...' : <>💾 Enregistrer</>}
          </Button>
        </div>
      </Card>
      
      {/* Modal pour ajouter/éditer */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingIndex !== null ? 'Modifier l\'article' : 'Ajouter un article'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Titre *"
            placeholder="Titre de l'article"
            value={modalItem.title}
            onChange={(e) => setModalItem({ ...modalItem, title: e.target.value })}
            required
          />
          
          <Input
            label="Lien (optionnel)"
            type="url"
            placeholder="https://..."
            value={modalItem.link || ''}
            onChange={(e) => handleLinkChange(e.target.value)}
          />
          
          {/* Upload d'image depuis téléphone/galerie */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Image (optionnel)
            </label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="image-upload"
                disabled={uploadingImage}
              />
              <label
                htmlFor="image-upload"
                className="flex-1 cursor-pointer"
              >
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-full"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <>📤 Upload en cours...</>
                  ) : (
                    <>📷 Prendre une photo / Choisir une image</>
                  )}
                </Button>
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Ou entrez une URL d'image ci-dessous
            </p>
          </div>
          
          <Input
            label="URL image (optionnel)"
            type="url"
            placeholder="https://..."
            value={modalItem.imageUrl || ''}
            onChange={(e) => setModalItem({ ...modalItem, imageUrl: e.target.value })}
          />
          
          {/* Image preview */}
          {modalItem.imageUrl && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Aperçu
              </label>
              <div className="relative">
                <img
                  src={getImageUrl(modalItem.imageUrl)}
                  alt="Aperçu"
                  className="max-w-full h-32 object-contain rounded border border-dark-border"
                  onError={(e) => {
                    // Essayer l'URL directe si le proxy échoue
                    const img = e.target as HTMLImageElement
                    if (img.src.includes('/api/image-proxy')) {
                      img.src = modalItem.imageUrl || ''
                    } else {
                      img.style.display = 'none'
                    }
                  }}
                  loading="lazy"
                  crossOrigin="anonymous"
                />
                {modalItem.imageUrl && (
                  <button
                    type="button"
                    onClick={() => setModalItem({ ...modalItem, imageUrl: undefined })}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs"
                    title="Supprimer l'image"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Catégorie
              </label>
              <select
                value={modalItem.category || ''}
                onChange={(e) => setModalItem({ ...modalItem, category: e.target.value || undefined })}
                className="input text-sm w-full"
              >
                <option value="">Aucune</option>
                {WISHLIST_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Prix estimé (€)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={modalItem.estimatedPrice || ''}
                onChange={(e) => setModalItem({ ...modalItem, estimatedPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Priorité
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setModalItem({ ...modalItem, priority: modalItem.priority === star ? undefined : star })}
                  className={`text-2xl transition-colors ${modalItem.priority && modalItem.priority >= star ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'}`}
                >
                  ★
                </button>
              ))}
              {modalItem.priority && (
                <span className="text-sm text-gray-400 ml-2">
                  ({modalItem.priority}/5)
                </span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Note (optionnel)
            </label>
            <textarea
              className="input min-h-[100px] resize-y w-full"
              placeholder="Ajoutez des détails..."
              value={modalItem.note || ''}
              onChange={(e) => setModalItem({ ...modalItem, note: e.target.value })}
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={closeModal}
              className="flex-1"
            >
              ❌ Annuler
            </Button>
            <Button
              onClick={saveModalItem}
              className="flex-1"
            >
              {editingIndex !== null ? <>💾 Enregistrer</> : <>➕ Ajouter</>}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
