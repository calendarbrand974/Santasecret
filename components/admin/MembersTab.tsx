'use client'

import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { Button } from '../Button'
import { Input } from '../Input'
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

interface Member {
  id: string
  displayName: string
  email: string | null
  role: string
  status: string
  joinCode: string
  joinedAt: string | null
  coupleKey: string | null
  wishlist: Wishlist | null
}

interface MembersTabProps {
  groupId: string
}

export function MembersTab({ groupId }: MembersTabProps) {
  const toast = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{
    user: {
      id: string
      displayName: string
      email: string | null
      emailVerified: boolean
      passwordSetAt: string | null
      createdAt: string
      updatedAt: string
    }
    member: {
      id: string
      role: string
      status: string
      joinCode: string
      joinedAt: string | null
      coupleKey: string | null
    }
  } | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFormData, setProfileFormData] = useState({
    displayName: '',
    email: '',
  })
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [addMemberLoading, setAddMemberLoading] = useState(false)
  const [addMemberFormData, setAddMemberFormData] = useState({
    displayName: '',
    email: '',
    coupleKey: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
  })
  const [resendingInvitation, setResendingInvitation] = useState<string | null>(null)
  
  const loadMembers = async () => {
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members`)
      const data = await res.json()
      setMembers(data.members || [])
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadMembers()
  }, [groupId])
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    toast.addToast('Code copié !', 'success')
    setTimeout(() => setCopiedCode(null), 2000)
  }
  
  const handleViewWishlist = (member: Member) => {
    setSelectedMember(member)
    setIsWishlistModalOpen(true)
  }
  
  const handleViewProfile = async (member: Member) => {
    setProfileLoading(true)
    setIsProfileModalOpen(true)
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members/${member.id}/profile`)
      if (!res.ok) {
        throw new Error('Erreur lors du chargement du profil')
      }
      const data = await res.json()
      setProfileData(data)
      setProfileFormData({
        displayName: data.user.displayName || '',
        email: data.user.email || '',
      })
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors du chargement', 'error')
      setIsProfileModalOpen(false)
    } finally {
      setProfileLoading(false)
    }
  }
  
  const handleSaveProfile = async () => {
    if (!profileData) return
    
    setProfileSaving(true)
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members/${profileData.member.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profileFormData.displayName,
          email: profileFormData.email || null,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }
      
      const data = await res.json()
      setProfileData({
        ...profileData,
        user: data.user,
      })
      
      // Mettre à jour la liste des membres
      const updatedMembers = members.map(m => 
        m.id === profileData.member.id 
          ? { ...m, displayName: data.user.displayName, email: data.user.email }
          : m
      )
      setMembers(updatedMembers)
      
      toast.addToast('Profil mis à jour avec succès', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setProfileSaving(false)
    }
  }
  
  const handleAddMember = async () => {
    if (!addMemberFormData.displayName.trim() && !addMemberFormData.email.trim()) {
      toast.addToast('Veuillez renseigner au moins un nom ou un email', 'error')
      return
    }
    
    setAddMemberLoading(true)
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: addMemberFormData.displayName.trim() || undefined,
          email: addMemberFormData.email.trim() || null,
          coupleKey: addMemberFormData.coupleKey.trim() || null,
          role: addMemberFormData.role,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'ajout')
      }
      
      const data = await res.json()
      setIsAddMemberModalOpen(false)
      setAddMemberFormData({
        displayName: '',
        email: '',
        coupleKey: '',
        role: 'MEMBER',
      })
      loadMembers()
      toast.addToast(`Membre ajouté avec succès (code: ${data.member.joinCode})`, 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de l\'ajout', 'error')
    } finally {
      setAddMemberLoading(false)
    }
  }
  
  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${member.displayName} ?\n\nCette action est irréversible et supprimera également sa wishlist et ses assignations.`)) {
      return
    }
    
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members/${member.id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
      
      loadMembers()
      toast.addToast('Membre supprimé avec succès', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de la suppression', 'error')
    }
  }
  
  const handleResendInvitation = async (member: Member) => {
    if (!member.email) {
      toast.addToast('Ce membre n\'a pas d\'email associé', 'error')
      return
    }
    
    setResendingInvitation(member.id)
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/members/${member.id}/resend-invitation`, {
        method: 'POST',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'envoi')
      }
      
      toast.addToast(`Email d'invitation renvoyé à ${member.displayName}`, 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de l\'envoi de l\'invitation', 'error')
    } finally {
      setResendingInvitation(null)
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
  
  if (loading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-bg rounded w-1/4"></div>
          <div className="h-10 bg-dark-bg rounded"></div>
          <div className="h-10 bg-dark-bg rounded"></div>
          <div className="h-10 bg-dark-bg rounded"></div>
        </div>
      </Card>
    )
  }
  
  return (
    <>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Membres ({members.length})</h2>
          <Button onClick={() => setIsAddMemberModalOpen(true)}>
            + Ajouter un membre
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-3">Nom</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rôle</th>
                <th className="text-left p-3">Statut</th>
                <th className="text-left p-3">Code</th>
                <th className="text-left p-3">Wishlist</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="border-b border-dark-border hover:bg-dark-surface/50 transition-colors">
                  <td className="p-3 font-medium">{member.displayName}</td>
                  <td className="p-3 text-gray-400">{member.email || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.role === 'ADMIN' ? 'bg-primary/20 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      member.status === 'JOINED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{member.joinCode}</span>
                      <button
                        onClick={() => handleCopyCode(member.joinCode)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode === member.joinCode ? '✓' : '📋'}
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    {member.wishlist ? (
                      <div className="text-sm">
                        <div className="text-gray-300">
                          {member.wishlist.itemsCount} article{member.wishlist.itemsCount > 1 ? 's' : ''}
                        </div>
                        {member.wishlist.totalBudget > 0 && (
                          <div className="text-gray-400 text-xs">
                            {member.wishlist.totalBudget.toFixed(2)}€
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="secondary"
                        onClick={() => handleViewProfile(member)}
                        className="text-xs px-3 py-1"
                      >
                        👤 Profil
                      </Button>
                      {member.wishlist && (
                        <Button
                          variant="secondary"
                          onClick={() => handleViewWishlist(member)}
                          className="text-xs px-3 py-1"
                        >
                          📝 Wishlist
                        </Button>
                      )}
                      {member.email && (
                        <Button
                          variant="secondary"
                          onClick={() => handleResendInvitation(member)}
                          disabled={resendingInvitation === member.id}
                          className="text-xs px-3 py-1"
                          title="Renvoyer l'email d'invitation"
                        >
                          {resendingInvitation === member.id ? '⏳' : '📧'}
                        </Button>
                      )}
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="text-red-400 hover:text-red-300 text-xs px-3 py-1 transition-colors"
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {selectedMember && (
        <Modal
          isOpen={isWishlistModalOpen}
          onClose={() => setIsWishlistModalOpen(false)}
          title={`Wishlist de ${selectedMember.displayName}`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {selectedMember.wishlist?.freeText && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Message libre</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{selectedMember.wishlist.freeText}</p>
              </div>
            )}
            
            {selectedMember.wishlist && selectedMember.wishlist.items.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Articles ({selectedMember.wishlist.itemsCount})
                </h3>
                <div className="space-y-3">
                  {selectedMember.wishlist.items
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
                                  className="text-white hover:underline"
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
            
            {(!selectedMember.wishlist || selectedMember.wishlist.itemsCount === 0) && !selectedMember.wishlist?.freeText && (
              <p className="text-gray-400 text-center py-8">Aucun article dans la wishlist</p>
            )}
          </div>
        </Modal>
      )}
      
      {profileData && (
        <Modal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false)
            setProfileData(null)
          }}
          title={`Profil de ${profileData.user.displayName}`}
        >
          {profileLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-gray-400">Chargement...</div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Nom d'affichage
                  </label>
                  <Input
                    value={profileFormData.displayName}
                    onChange={(e) => setProfileFormData({ ...profileFormData, displayName: e.target.value })}
                    placeholder="Nom d'affichage"
                  />
                </div>
                
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileFormData.email}
                    onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })}
                    placeholder="Email (optionnel)"
                  />
                </div>
              </div>
              
              <div className="border-t border-dark-border pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Email vérifié</span>
                  <span className={profileData.user.emailVerified ? 'text-green-400' : 'text-gray-500'}>
                    {profileData.user.emailVerified ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Mot de passe défini</span>
                  <span className={profileData.user.passwordSetAt ? 'text-green-400' : 'text-gray-500'}>
                    {profileData.user.passwordSetAt ? 'Oui' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rôle</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    profileData.member.role === 'ADMIN' ? 'bg-primary/20 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {profileData.member.role}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Statut</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    profileData.member.status === 'JOINED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {profileData.member.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Code de participation</span>
                  <span className="font-mono">{profileData.member.joinCode}</span>
                </div>
                {profileData.member.coupleKey && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Clé de couple</span>
                    <span className="text-gray-300">{profileData.member.coupleKey}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Compte créé le</span>
                  <span className="text-gray-300">{formatDate(profileData.user.createdAt)}</span>
                </div>
                {profileData.member.joinedAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rejoint le</span>
                    <span className="text-gray-300">{formatDate(profileData.member.joinedAt)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4 border-t border-dark-border">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsProfileModalOpen(false)
                    setProfileData(null)
                  }}
                  className="flex-1"
                >
                  ❌ Annuler
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex-1"
                >
                  {profileSaving ? '⏳ Sauvegarde...' : <>💾 Enregistrer</>}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
      
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false)
          setAddMemberFormData({
            displayName: '',
            email: '',
            coupleKey: '',
            role: 'MEMBER',
          })
        }}
        title="Ajouter un membre"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Nom d'affichage <span className="text-gray-500">(optionnel)</span>
            </label>
            <Input
              value={addMemberFormData.displayName}
              onChange={(e) => setAddMemberFormData({ ...addMemberFormData, displayName: e.target.value })}
              placeholder="Nom d'affichage"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Email <span className="text-gray-500">(optionnel)</span>
            </label>
            <Input
              type="email"
              value={addMemberFormData.email}
              onChange={(e) => setAddMemberFormData({ ...addMemberFormData, email: e.target.value })}
              placeholder="Email"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Clé de couple <span className="text-gray-500">(optionnel)</span>
            </label>
            <Input
              value={addMemberFormData.coupleKey}
              onChange={(e) => setAddMemberFormData({ ...addMemberFormData, coupleKey: e.target.value })}
              placeholder="Ex: couple-a"
            />
            <p className="mt-1 text-xs text-gray-400">
              Les membres avec la même clé ne pourront pas se tirer au sort
            </p>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Rôle
            </label>
            <select
              value={addMemberFormData.role}
              onChange={(e) => setAddMemberFormData({ ...addMemberFormData, role: e.target.value as 'ADMIN' | 'MEMBER' })}
              className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-white"
            >
              <option value="MEMBER">Membre</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-dark-border">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddMemberModalOpen(false)
                setAddMemberFormData({
                  displayName: '',
                  email: '',
                  coupleKey: '',
                  role: 'MEMBER',
                })
              }}
              className="flex-1"
            >
              ❌ Annuler
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={addMemberLoading}
              className="flex-1"
            >
              {addMemberLoading ? '⏳ Ajout...' : <>➕ Ajouter</>}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
