'use client'

import { useEffect, useState } from 'react'
import { Card } from '../Card'

interface AuditLog {
  id: string
  action: string
  actorName: string
  actorEmail: string | null
  payload: any
  createdAt: string
}

interface AuditTabProps {
  groupId: string
}

const ACTION_LABELS: Record<string, string> = {
  ADMIN_VIEW_ALL: 'Consultation des paires',
  ADMIN_DELETE_PAIR: 'Suppression de paire',
  ADMIN_REMATCH: 'Ré-appairage',
  MEMBER_REVEAL: 'Révélation',
  MEMBER_UPDATE_WISHLIST: 'Mise à jour wishlist',
  MEMBER_JOIN: 'Rejoindre le groupe',
  MEMBER_SET_PASSWORD: 'Définition du mot de passe',
}

export function AuditTab({ groupId }: AuditTabProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [total, setTotal] = useState(0)
  
  useEffect(() => {
    loadLogs()
  }, [groupId, selectedAction])
  
  const loadLogs = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedAction !== 'all') {
        params.append('action', selectedAction)
      }
      params.append('limit', '100')
      
      const res = await fetch(`/api/admin/groups/${groupId}/audit?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
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
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Logs d'audit ({total})</h2>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-dark-surface border border-dark-border rounded px-3 py-2 text-sm text-white"
          >
            <option value="all">Toutes les actions</option>
            {Object.entries(ACTION_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Action</th>
                <th className="text-left p-3">Utilisateur</th>
                <th className="text-left p-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    Aucun log d'audit
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-dark-border hover:bg-dark-surface/50 transition-colors">
                    <td className="p-3 text-sm text-gray-400">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-primary/20 text-white">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="text-white">{log.actorName}</div>
                        {log.actorEmail && (
                          <div className="text-xs text-gray-400">{log.actorEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {log.payload && Object.keys(log.payload).length > 0 ? (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-gray-400 hover:text-white">
                            Voir les détails
                          </summary>
                          <pre className="mt-2 p-2 bg-dark-bg rounded text-xs text-gray-300 overflow-x-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
