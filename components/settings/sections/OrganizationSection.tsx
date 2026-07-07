'use client'

import { useState } from 'react'
import { Building2, Globe, Phone, Mail, MapPin, Calendar, Upload, Check } from 'lucide-react'
import { SettingsCard, Field, TextInput } from '../SettingsCard'

interface Props {
  delay?: number
}

export function OrganizationSection({ delay = 0 }: Props) {
  const [orgName, setOrgName] = useState('Abu Dhabi National Takaful Co. P.S.C.')
  const [orgShort, setOrgShort] = useState('ADNTC')
  const [domain, setDomain] = useState('adntc.ae')
  const [email, setEmail] = useState('contact@adntc.ae')
  const [phone, setPhone] = useState('+971 2 626 2222')
  const [address, setAddress] = useState('ADNOC Complex, Al Muroor Road, Abu Dhabi, UAE')
  const [founded, setFounded] = useState('2011')
  const [currency, setCurrency] = useState('AED')
  const [timezone, setTimezone] = useState('Asia/Dubai (GST+4)')
  const [language, setLanguage] = useState('English')

  const selectCls = 'h-[36px] w-full appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-9 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] cursor-pointer'

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard
        title="Organization Profile"
        description="Primary identity and contact details for ADNTC"
        icon={Building2}
        accent="var(--primary)"
        delay={delay}
        action={
          <button
            className="inline-flex h-[32px] items-center gap-2.5 rounded-[9px] px-3 text-[11.5px] font-semibold text-white transition-all hover:opacity-90 items-center justify-center text-center"
            style={{ background: 'var(--primary)' }}
          >
            <Check size={12} strokeWidth={2.2} /> Save
          </button>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Legal Name">
            <TextInput value={orgName} onChange={setOrgName} />
          </Field>
          <Field label="Short Name">
            <TextInput value={orgShort} onChange={setOrgShort} />
          </Field>
          <Field label="Domain">
            <div className="relative">
              <Globe size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <TextInput value={domain} onChange={setDomain} className="pl-9" />
            </div>
          </Field>
          <Field label="Founded">
            <div className="relative">
              <Calendar size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <TextInput value={founded} onChange={setFounded} className="pl-9" />
            </div>
          </Field>
          <Field label="Contact Email">
            <div className="relative">
              <Mail size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <TextInput value={email} onChange={setEmail} className="pl-9" />
            </div>
          </Field>
          <Field label="Contact Phone">
            <div className="relative">
              <Phone size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <TextInput value={phone} onChange={setPhone} className="pl-9" />
            </div>
          </Field>
          <Field label="Address" className="md:col-span-2">
            <div className="relative">
              <MapPin size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <TextInput value={address} onChange={setAddress} className="pl-9" />
            </div>
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Localization"
        description="Currency, timezone, and default language for the platform"
        icon={Globe}
        accent="var(--emerald)"
        delay={delay + 0.05}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Currency">
            <div className="relative">
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className={selectCls}
              >
                <option value="AED">AED — UAE Dirham</option>
                <option value="USD">USD — US Dollar</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>
          </Field>
          <Field label="Timezone">
            <div className="relative">
              <select
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className={selectCls}
              >
                <option>Asia/Dubai (GST+4)</option>
                <option>Asia/Riyadh (AST+3)</option>
                <option>Europe/London (GMT+0)</option>
                <option>America/New_York (EST-5)</option>
              </select>
            </div>
          </Field>
          <Field label="Default Language">
            <div className="relative">
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className={selectCls}
              >
                <option>English</option>
                <option>Arabic</option>
                <option>Bilingual (EN/AR)</option>
              </select>
            </div>
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Brand Identity"
        description="Logo and color palette used across surveys and reports"
        icon={Upload}
        accent="var(--tint-purple-fg)"
        delay={delay + 0.1}
      >
        <div className="flex flex-wrap items-center gap-4">
          {/* Logo preview */}
          <div
            className="flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center rounded-[14px]"
            style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              color: '#fff',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <span className="text-[18px] font-extrabold" style={{ letterSpacing: '-0.03em' }}>AD</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[12.5px] font-semibold" style={{ color: 'var(--text)' }}>ADNTC Logo</div>
            <div className="text-[10.5px]" style={{ color: 'var(--text-light)' }}>PNG · SVG · 512×512px recommended</div>
            <div className="mt-2 flex items-center gap-2">
              <button
                className="inline-flex h-[30px] items-center gap-2.5 rounded-[8px] border bg-white px-3 text-[11px] font-semibold transition-all items-center justify-center text-center"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <Upload size={11} strokeWidth={2.1} /> Upload New
              </button>
              <button
                className="inline-flex h-[30px] items-center rounded-[8px] px-3 text-[11px] font-semibold transition-all items-center justify-center text-center"
                style={{ color: 'var(--red)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--tint-red)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>

        {/* Brand colors */}
        <div className="mt-4 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <div className="mb-2.5 text-[10.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
            Brand Colors
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { name: 'Primary', hex: '#0B4A8B' },
              { name: 'Accent',  hex: '#17A673' },
              { name: 'Warning', hex: '#F5A623' },
              { name: 'Danger',  hex: '#E5484D' },
            ].map(c => (
              <div
                key={c.name}
                className="flex items-center gap-2 rounded-[8px] border p-2"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
              >
                <div
                  className="h-[24px] w-[24px] flex-shrink-0 rounded-[6px]"
                  style={{ background: c.hex, border: '1px solid rgba(0,0,0,0.1)' }}
                />
                <div className="min-w-0">
                  <div className="text-[10.5px] font-semibold" style={{ color: 'var(--text)' }}>{c.name}</div>
                  <div className="text-[9.5px] font-mono" style={{ color: 'var(--text-muted)' }}>{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
