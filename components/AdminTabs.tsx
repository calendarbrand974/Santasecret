'use client'

import { useState } from 'react'
import { MembersTab } from './admin/MembersTab'
import { PairsTab } from './admin/PairsTab'
import { AuditTab } from './admin/AuditTab'
import { SettingsTab } from './admin/SettingsTab'

interface AdminTabsProps {
  groupId: string
}

export function AdminTabs({ groupId }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'pairs' | 'audit' | 'settings'>('members')
  
  return (
    <div>
      <div className="flex gap-2 border-b border-dark-border mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'members'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          👥 Membres
        </button>
        <button
          onClick={() => setActiveTab('pairs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'pairs'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          🎯 Paires
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'audit'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          📋 Audit
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-white border-b-2 border-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚙️ Paramètres
        </button>
      </div>
      
      {activeTab === 'members' && <MembersTab groupId={groupId} />}
      {activeTab === 'pairs' && <PairsTab groupId={groupId} />}
      {activeTab === 'audit' && <AuditTab groupId={groupId} />}
      {activeTab === 'settings' && <SettingsTab groupId={groupId} />}
    </div>
  )
}

