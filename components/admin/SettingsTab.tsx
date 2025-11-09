'use client'

import { useEffect, useState } from 'react'
import { Card } from '../Card'
import { Button } from '../Button'
import { Input } from '../Input'
import { Modal } from '../Modal'
import { useToast } from '../Toast'

interface Group {
  id: string
  name: string
  timeZone: string
  openAt: string
}

interface Member {
  id: string
  displayName: string
}

interface ForbiddenPair {
  id: string
  giverId: string
  giverName: string
  receiverId: string
  receiverName: string
  createdAt: string
}

interface SettingsTabProps {
  groupId: string
}

const COMMON_TIMEZONES = [
  'Indian/Reunion',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
]

export function SettingsTab({ groupId }: SettingsTabProps) {
  const toast = useToast()
  const [group, setGroup] = useState<Group | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [forbiddenPairs, setForbiddenPairs] = useState<ForbiddenPair[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAddPairModalOpen, setIsAddPairModalOpen] = useState(false)
  const [selectedGiverId, setSelectedGiverId] = useState('')
  const [selectedReceiverId, setSelectedReceiverId] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    timeZone: '',
    openAt: '',
  })
  
  useEffect(() => {
    loadData()
  }, [groupId])
  
  const loadData = async () => {
    try {
      const [groupRes, membersRes, pairsRes] = await Promise.all([
        fetch(`/api/admin/groups/${groupId}/settings`),
        fetch(`/api/admin/groups/${groupId}/members`),
        fetch(`/api/admin/groups/${groupId}/forbidden-pairs`),
      ])
      
      const [groupData, membersData, pairsData] = await Promise.all([
        groupRes.json(),
        membersRes.json(),
        pairsRes.json(),
      ])
      
      if (groupData.group) {
        setGroup(groupData.group)
        const openAtDate = new Date(groupData.group.openAt)
        const localDateTime = new Date(openAtDate.getTime() - openAtDate.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16)
        
        setFormData({
          name: groupData.group.name,
          timeZone: groupData.group.timeZone,
          openAt: localDateTime,
        })
      }
      
      if (membersData.members) {
        setMembers(membersData.members.map((m: any) => ({
          id: m.id,
          displayName: m.displayName,
        })))
      }
      
      if (pairsData.forbiddenPairs) {
        setForbiddenPairs(pairsData.forbiddenPairs)
      }
      
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }
  
  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      // Convertir la date locale en ISO avec timezone
      const openAtDate = new Date(formData.openAt)
      const openAtISO = openAtDate.toISOString()
      
      const res = await fetch(`/api/admin/groups/${groupId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          timeZone: formData.timeZone,
          openAt: openAtISO,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }
      
      const data = await res.json()
      setGroup(data.group)
      toast.addToast('Paramètres sauvegardés avec succès', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de la sauvegarde', 'error')
    } finally {
      setSaving(false)
    }
  }
  
  const handleAddForbiddenPair = async () => {
    if (!selectedGiverId || !selectedReceiverId) {
      toast.addToast('Sélectionnez un donneur et un receveur', 'error')
      return
    }
    
    if (selectedGiverId === selectedReceiverId) {
      toast.addToast('Un membre ne peut pas être interdit avec lui-même', 'error')
      return
    }
    
    // Vérification supplémentaire : s'assurer que les IDs sont bien différents
    const giverMember = members.find(m => m.id === selectedGiverId)
    const receiverMember = members.find(m => m.id === selectedReceiverId)
    
    if (!giverMember || !receiverMember) {
      toast.addToast('Membre(s) non trouvé(s)', 'error')
      return
    }
    
    if (giverMember.id === receiverMember.id) {
      toast.addToast('Un membre ne peut pas être interdit avec lui-même', 'error')
      return
    }
    
    // Log pour débogage
    console.log('Adding forbidden pair:', {
      giverId: selectedGiverId,
      giverName: giverMember.displayName,
      receiverId: selectedReceiverId,
      receiverName: receiverMember.displayName,
    })
    
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/forbidden-pairs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giverId: selectedGiverId,
          receiverId: selectedReceiverId,
        }),
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de l\'ajout')
      }
      
      setIsAddPairModalOpen(false)
      setSelectedGiverId('')
      setSelectedReceiverId('')
      loadData()
      toast.addToast('Paire interdite ajoutée avec succès', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de l\'ajout', 'error')
    }
  }
  
  const handleDeleteForbiddenPair = async (pairId: string) => {
    if (!confirm('Supprimer cette paire interdite ?')) return
    
    try {
      const res = await fetch(`/api/admin/groups/${groupId}/forbidden-pairs/${pairId}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
      
      loadData()
      toast.addToast('Paire interdite supprimée avec succès', 'success')
    } catch (err: any) {
      toast.addToast(err.message || 'Erreur lors de la suppression', 'error')
    }
  }
  
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
  
  return (
    <>
      <div className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Paramètres du groupe</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Nom du groupe
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom du groupe"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Fuseau horaire
              </label>
              <select
                value={formData.timeZone}
                onChange={(e) => setFormData({ ...formData, timeZone: e.target.value })}
                className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-white"
              >
                {COMMON_TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Date et heure d'ouverture du tirage
              </label>
              <Input
                type="datetime-local"
                value={formData.openAt}
                onChange={(e) => setFormData({ ...formData, openAt: e.target.value })}
              />
            </div>
            
            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? '⏳ Sauvegarde...' : <>💾 Sauvegarder les paramètres</>}
            </Button>
          </div>
        </Card>
        
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Paires interdites</h2>
            <Button variant="secondary" onClick={() => setIsAddPairModalOpen(true)}>
              ➕ Ajouter une paire interdite
            </Button>
          </div>
          
          {forbiddenPairs.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Aucune paire interdite définie
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-border">
                    <th className="text-left p-3">Donneur</th>
                    <th className="text-left p-3">→</th>
                    <th className="text-left p-3">Receveur</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forbiddenPairs.map(pair => (
                    <tr key={pair.id} className="border-b border-dark-border hover:bg-dark-surface/50 transition-colors">
                      <td className="p-3 font-medium">{pair.giverName}</td>
                      <td className="p-3 text-primary">→</td>
                      <td className="p-3 font-medium">{pair.receiverName}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleDeleteForbiddenPair(pair.id)}
                          className="text-red-400 hover:text-red-300 text-sm transition-colors"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      
      <Modal
        isOpen={isAddPairModalOpen}
        onClose={() => {
          setIsAddPairModalOpen(false)
          setSelectedGiverId('')
          setSelectedReceiverId('')
        }}
        title="Ajouter une paire interdite"
      >
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Donneur
            </label>
            <select
              value={selectedGiverId}
              onChange={(e) => setSelectedGiverId(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-white"
            >
              <option value="">Sélectionner un donneur</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.displayName}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Receveur
            </label>
            <select
              value={selectedReceiverId}
              onChange={(e) => setSelectedReceiverId(e.target.value)}
              className="w-full bg-dark-surface border border-dark-border rounded px-3 py-2 text-white"
            >
              <option value="">Sélectionner un receveur</option>
              {members
                .filter(m => m.id !== selectedGiverId)
                .map(member => (
                  <option key={member.id} value={member.id}>{member.displayName}</option>
                ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsAddPairModalOpen(false)
                setSelectedGiverId('')
                setSelectedReceiverId('')
              }}
              className="flex-1"
            >
              ❌ Annuler
            </Button>
            <Button onClick={handleAddForbiddenPair} className="flex-1">
              ➕ Ajouter
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

