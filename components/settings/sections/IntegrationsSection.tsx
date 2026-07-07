'use client'

import { useState } from 'react'
import {
  Plug, Mail, MessageSquare, Phone, Slack, Webhook, Database, Cloud, Plus,
  Check, Settings as Cog, ExternalLink, RefreshCw, Zap,
} from 'lucide-react'
import { SettingsCard } from '../SettingsCard'

interface Props {
  delay?: number
}

interface Integration {
  id: string
  name: string
  category: string
  description: string
  icon: typeof Plug
  color: string
  status: 'connected' | 'available' | 'beta'
  lastSync?: string
}

export function IntegrationsSection({ delay = 0 }: Props) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'whatsapp',    name: 'WhatsApp Business',    category: 'Messaging',    description: 'Send surveys and follow-ups via WhatsApp',          icon: MessageSquare, color: '#17A673', status: 'connected', lastSync: '2 min ago' },
    { id: 'smtp',        name: 'SMTP / Email Gateway',  category: 'Email',        description: 'Custom email sender via ADNTC domain',              icon: Mail,          color: '#0B4A8B', status: 'connected', lastSync: '5 min ago' },
    { id: 'twilio',      name: 'Twilio SMS',            category: 'SMS',          description: 'SMS survey invitations and reminders',              icon: Phone,         color: '#E5484D', status: 'connected', lastSync: '12 min ago' },
    { id: 'salesforce',  name: 'Salesforce CRM',        category: 'CRM',          description: 'Sync customer profiles and cases',                  icon: Database,      color: '#0A84FF', status: 'available' },
    { id: 'slack',       name: 'Slack',                 category: 'Notifications',description: 'Push alerts to Slack channels',                     icon: Slack,         color: '#7C3AED', status: 'available' },
    { id: 'webhook',     name: 'Custom Webhook',        category: 'Developer',    description: 'POST events to your endpoint',                      icon: Webhook,       color: '#F5A623', status: 'available' },
    { id: 'azure',       name: 'Azure Blob Storage',    category: 'Storage',      description: 'Archive exports and attachments',                   icon: Cloud,         color: '#0A84FF', status: 'connected', lastSync: '1 hour ago' },
    { id: 'powerbi',     name: 'Power BI',              category: 'Analytics',    description: 'Stream NPS data to Power BI dashboards',            icon: Zap,           color: '#F5A623', status: 'beta' },
  ])

  function toggleIntegration(id: string) {
    setIntegrations(prev => prev.map(i => {
      if (i.id !== id) return i
      const nextStatus: Integration['status'] = i.status === 'connected' ? 'available' : 'connected'
      return { ...i, status: nextStatus, lastSync: nextStatus === 'connected' ? 'just now' : undefined }
    }))
  }

  const statusConfig: Record<Integration['status'], { label: string; cls: string; dot: string }> = {
    connected: { label: 'Connected', cls: 'bg-[var(--tint-emerald)] border-[rgba(23,166,115,0.3)] text-[var(--emerald)]', dot: 'var(--emerald)' },
    available: { label: 'Available', cls: 'bg-[var(--bg-subtle)] border-[var(--border)] text-[var(--text-light)]',           dot: 'var(--text-light)' },
    beta:      { label: 'Beta',      cls: 'bg-[var(--tint-amber)] border-[rgba(245,166,35,0.3)] text-[var(--tint-amber-fg)]',  dot: '#F5A623' },
  }

  const connectedCount = integrations.filter(i => i.status === 'connected').length

  return (
    <div className="flex flex-col gap-6">
      {/* Overview */}
      <SettingsCard
        title="Connected Services"
        description={`${connectedCount} of ${integrations.length} integrations active`}
        icon={Plug}
        accent="var(--primary)"
        delay={delay}
        action={
          <button
            className="inline-flex h-[32px] items-center gap-2.5 rounded-[9px] border bg-white px-3 text-[11.5px] font-semibold transition-all items-center justify-center text-center"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <Plus size={12} strokeWidth={2.2} /> Browse Marketplace
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {integrations.map(int => {
            const Icon = int.icon
            const cfg = statusConfig[int.status]
            const isConnected = int.status === 'connected'
            return (
              <div
                key={int.id}
                className="flex flex-col gap-4 rounded-[12px] p-5 transition-all"
                style={{
                  background: isConnected ? `${int.color}06` : 'white',
                  border: `1px solid ${isConnected ? `${int.color}30` : 'var(--border)'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: `${int.color}1A`, color: int.color }}
                  >
                    <Icon size={18} strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12.5px] font-bold line-clamp-2 leading-tight" style={{ color: 'var(--text)' }}>{int.name}</span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] ${cfg.cls}`}
                      >
                        <span className="h-1 w-1 rounded-full" style={{ background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.04em] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {int.category}
                    </div>
                    <div className="mt-1 text-[10.5px]" style={{ color: 'var(--text-light)' }}>{int.description}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {isConnected && int.lastSync ? (
                      <span className="flex items-center gap-1">
                        <RefreshCw size={9} /> Last sync: {int.lastSync}
                      </span>
                    ) : int.status === 'beta' ? (
                      <span className="flex items-center gap-1" style={{ color: 'var(--tint-amber-fg)' }}>
                        <Zap size={9} /> Early access preview
                      </span>
                    ) : (
                      <span>Not configured</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {isConnected && (
                      <>
                        <button
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] transition-all"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          title="Configure"
                        >
                          <Cog size={12} strokeWidth={2.1} />
                        </button>
                        <button
                          className="flex h-[26px] w-[26px] items-center justify-center rounded-[6px] transition-all"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.color = 'var(--text)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                          title="Open docs"
                        >
                          <ExternalLink size={12} strokeWidth={2.1} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleIntegration(int.id)}
                      className="inline-flex h-[26px] items-center gap-1 rounded-[6px] px-2 text-[10.5px] font-semibold transition-all"
                      style={isConnected
                        ? { color: 'var(--red)' }
                        : { background: 'var(--primary)', color: '#fff' }
                      }
                      onMouseEnter={(e) => {
                        if (isConnected) e.currentTarget.style.background = 'var(--tint-red)'
                        else e.currentTarget.style.opacity = '0.9'
                      }}
                      onMouseLeave={(e) => {
                        if (isConnected) e.currentTarget.style.background = 'transparent'
                        else e.currentTarget.style.opacity = '1'
                      }}
                    >
                      {isConnected
                        ? <>Disconnect</>
                        : <><Plus size={10} strokeWidth={2.5} /> Connect</>
                      }
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </SettingsCard>

      {/* API Keys */}
      <SettingsCard
        title="API Keys"
        description="Programmatic access tokens for custom integrations"
        icon={Webhook}
        accent="var(--tint-purple-fg)"
        delay={delay + 0.05}
        action={
          <button
            className="inline-flex h-[32px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 items-center justify-center text-center"
            style={{ background: 'var(--primary)' }}
          >
            <Plus size={12} strokeWidth={2.2} /> New Key
          </button>
        }
      >
        <div className="flex flex-col gap-2">
          {[
            { id: 'k1', name: 'Production API', key: 'sk-prod-••••••••••••••••4f8a', created: 'Jan 12, 2025', lastUsed: '2 min ago' },
            { id: 'k2', name: 'Webhook Sync',   key: 'sk-web-••••••••••••••••a2c9',  created: 'Mar 03, 2025', lastUsed: '4 hours ago' },
            { id: 'k3', name: 'Dev Sandbox',    key: 'sk-dev-••••••••••••••••91be',  created: 'May 20, 2025', lastUsed: '2 days ago' },
          ].map(k => (
            <div
              key={k.id}
              className="flex items-center gap-3 rounded-[10px] p-3"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[8px]"
                style={{ background: 'white', color: 'var(--primary)', border: '1px solid var(--border)' }}
              >
                <Webhook size={13} strokeWidth={2.1} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold" style={{ color: 'var(--text)' }}>{k.name}</span>
                  <code className="font-mono text-[10.5px] tabular px-1.5 py-0.5 rounded-[4px]" style={{ background: 'white', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                    {k.key}
                  </code>
                </div>
                <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Created {k.created} · Last used {k.lastUsed}
                </div>
              </div>
              <button
                className="flex-shrink-0 rounded-[6px] px-2.5 py-1 text-[10.5px] font-semibold transition-all items-center justify-center text-center"
                style={{ color: 'var(--red)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Revoke
              </button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Webhook Endpoints */}
      <SettingsCard
        title="Webhook Endpoints"
        description="Receive real-time event notifications at your endpoints"
        icon={Webhook}
        accent="var(--emerald)"
        delay={delay + 0.1}
      >
        <div className="flex flex-col gap-2">
          {[
            { id: 'w1', url: 'https://api.adntc.ae/webhooks/nps-events', events: 8, status: 'active' },
            { id: 'w2', url: 'https://hooks.adntc-crm.com/cx-platform',  events: 4, status: 'active' },
          ].map(w => (
            <div
              key={w.id}
              className="flex items-center gap-3 rounded-[10px] p-3"
              style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
            >
              <div
                className="flex h-[8px] w-[8px] flex-shrink-0 rounded-full"
                style={{ background: 'var(--emerald)' }}
                title="Active"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11.5px] font-mono font-semibold" style={{ color: 'var(--text)' }}>
                  {w.url}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-light)' }}>
                  {w.events} events subscribed · 200 OK · last delivery 12s ago
                </div>
              </div>
              <button
                className="flex-shrink-0 rounded-[6px] px-2.5 py-1 text-[10.5px] font-semibold transition-all items-center justify-center text-center"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                Test
              </button>
              <button
                className="flex-shrink-0 rounded-[6px] px-2.5 py-1 text-[10.5px] font-semibold transition-all items-center justify-center text-center"
                style={{ color: 'var(--red)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-3 inline-flex h-[34px] items-center gap-2.5 rounded-[9px] border border-dashed px-3 text-[11.5px] font-semibold transition-all items-center justify-center text-center"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          <Plus size={12} strokeWidth={2.2} /> Add Webhook Endpoint
        </button>
      </SettingsCard>
    </div>
  )
}
