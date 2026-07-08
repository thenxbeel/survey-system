'use client'

import { useState, useEffect } from 'react'
import {
  User, Mail, Phone, Briefcase, Calendar, Camera, Check, AtSign, Loader2, RefreshCw, Edit2,
} from 'lucide-react'
import { SettingsCard, Field, TextInput } from '../SettingsCard'
import { useSettings, type UserProfile } from '@/lib/stores/SettingsStore'
import { useToast } from '@/lib/stores/ToastStore'

interface Props {
  delay?: number
}

interface LiveStats {
  surveysManaged:  number
  casesHandled:    number
  averageNps:      number | null
  teamMembers:     number
}

export function ProfileSection({ delay = 0 }: Props) {
  const { state, updateProfile } = useSettings()
  const toast = useToast()
  const profile = state.profile

  // Local form state — initialized from the store, synced back on Save.
  const [fullName,    setFullName]    = useState(profile.fullName)
  const [displayName, setDisplayName] = useState(profile.displayName)
  const [email,       setEmail]       = useState(profile.email)
  const [phone,       setPhone]       = useState(profile.phone)
  const [role,        setRole]        = useState(profile.role)
  const [department,  setDepartment]  = useState(profile.department)
  const [branch,      setBranch]      = useState(profile.branch)
  const [bio,         setBio]         = useState(profile.bio)
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor)

  const [liveStats, setLiveStats] = useState<LiveStats>({
    surveysManaged: 0,
    casesHandled: 0,
    averageNps: null,
    teamMembers: 0,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  // Joined date formatted
  const joinedDateStr = profile.joinedDate
    ? new Date(profile.joinedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '30 Jun 2024' // fallback

  useEffect(() => {
    setFullName(profile.fullName)
    setDisplayName(profile.displayName)
    setEmail(profile.email)
    setPhone(profile.phone)
    setRole(profile.role)
    setDepartment(profile.department)
    setBranch(profile.branch)
    setBio(profile.bio)
    setAvatarColor(profile.avatarColor)
  }, [profile.fullName, profile.displayName, profile.email, profile.phone,
      profile.role, profile.department, profile.branch, profile.bio,
      profile.avatarColor])

  const fetchStats = async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/me/stats', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      const d = json.data ?? {}
      setLiveStats({
        surveysManaged: d.surveysManaged ?? 0,
        casesHandled: d.casesHandled ?? 0,
        averageNps: d.averageNps ?? null,
        teamMembers: d.teamMembers ?? 0,
      })
    } catch {
      // ignore
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const initials = fullName.trim().split(/\s+/).map(n => n[0] ?? '').slice(0, 2).join('').toUpperCase() || 'SA'

  const selectCls = 'h-[36px] w-full appearance-none rounded-[9px] border border-[var(--border)] bg-white pl-3 pr-9 text-[12px] font-medium text-[var(--text)] outline-none transition-all hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[rgba(11,74,139,0.1)] cursor-pointer'

  const avatarColors = ['#0B4A8B', '#17A673', '#F5A623', '#E5484D', '#7C3AED', '#06B6D4']

  async function handleSave() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Invalid Email', 'Please enter a valid email address.')
      return
    }

    const patch: Partial<UserProfile> = {
      fullName,
      displayName,
      email,
      phone,
      role,
      department,
      branch,
      bio,
      avatarColor,
      avatarInitials: initials,
    }
    updateProfile(patch)
    
    if (profile.id) {
      try {
        await fetch(`/api/users/${profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            email,
            phone,
          })
        })
      } catch {
        // ignore errors for now
      }
    }

    toast.success('Profile saved', 'Your profile changes are now live across the platform.')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Personal Information */}
      <SettingsCard
        title="Personal Information"
        description="Update your personal details and preferences"
        icon={User}
        accent="var(--primary)"
        delay={delay}
        action={
          <button
            onClick={handleSave}
            className="inline-flex h-[32px] items-center gap-2.5 rounded-[8px] bg-[#0B4A8B] px-8.5 text-[11.5px] font-semibold text-white transition-all hover:bg-[#06386F] items-center justify-center text-center"
          >
            Save Changes
          </button>
        }
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left Side: Avatar Column */}
          <div className="flex flex-col items-center gap-2.5 lg:w-[130px] lg:flex-shrink-0">
            <div className="relative">
              <div
                className="flex h-[100px] w-[100px] items-center justify-center rounded-full text-[32px] font-extrabold text-white"
                style={{ background: `linear-gradient(135deg, ${avatarColor} 0%, ${shade(avatarColor, -0.2)} 100%)`, boxShadow: 'var(--shadow-md)' }}
              >
                {initials}
              </div>
            </div>
          </div>

          {/* Right Side: Form Fields */}
          <div className="flex-1 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Full Name">
              <TextInput value={fullName} onChange={setFullName} />
            </Field>
            <Field label="Display Name">
              <TextInput value={displayName} onChange={setDisplayName} />
            </Field>
            <Field label="Email">
              <TextInput type="email" value={email} onChange={setEmail} />
            </Field>
            <Field label="Phone">
              <TextInput value={phone} onChange={setPhone} placeholder="-" />
            </Field>
            <Field label="Department">
              <TextInput value={department || ''} onChange={setDepartment} />
            </Field>
            <Field label="Branch">
              <TextInput value={branch || ''} onChange={setBranch} />
            </Field>
            <Field label="Role" className="md:col-span-2">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className={selectCls}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="User">User</option>
              </select>
            </Field>
            <Field label="Bio" className="md:col-span-2">
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={3}
                placeholder="Add a short bio about yourself..."
                className="w-full resize-none rounded-[9px] border bg-white px-3 py-2 text-[12px] font-medium outline-none transition-all focus:ring-2"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(11,74,139,0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </Field>

            {/* Avatar color picker inside the personal info card */}
            <div className="md:col-span-2 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <div className="mb-2 text-[10.5px] font-bold uppercase tracking-[0.08em]" style={{ color: 'var(--text-light)' }}>
                Avatar Color
              </div>
              <div className="flex flex-wrap gap-2">
                {avatarColors.map(c => {
                  const active = avatarColor === c
                  return (
                    <button
                      key={c}
                      onClick={() => setAvatarColor(c)}
                      className="flex h-[32px] w-[32px] items-center justify-center rounded-full transition-all hover:scale-105"
                      style={{
                        background: c,
                        border: active ? '2px solid var(--text)' : '2px solid transparent',
                        boxShadow: active ? '0 0 0 2px white, 0 0 0 4px ' + c : 'none',
                      }}
                      aria-label={`Avatar color ${c}`}
                      title={c}
                    >
                      {active && <Check size={12} color="#fff" strokeWidth={3} />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Work Details */}
      <SettingsCard
        title="Work Details"
        description="Your professional work information"
        icon={Briefcase}
        accent="var(--emerald)"
        delay={delay + 0.05}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA0B5]">Department</div>
            <div className="mt-1 text-[13px] font-semibold text-[#0D1B2E]">{department || 'Information Technology'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA0B5]">Branch</div>
            <div className="mt-1 text-[13px] font-semibold text-[#0D1B2E]">{branch || 'Head Office'}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#8FA0B5]">Joined Date</div>
            <div className="mt-1 flex items-center gap-2.5 text-[13px] font-semibold text-[#0D1B2E]">
              <Calendar size={13} className="text-[#8FA0B5]" />
              {joinedDateStr}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Profile Activity */}
      <SettingsCard
        title="Profile Activity"
        description="Recent changes to your profile"
        icon={AtSign}
        accent="var(--tint-purple-fg)"
        delay={delay + 0.1}
        action={
          <button
            onClick={fetchStats}
            disabled={statsLoading}
            className="flex items-center gap-2.5 rounded-[8px] border border-[#E2E8F3] bg-white px-6 py-3 text-[11.5px] font-semibold text-[#4A5568] hover:bg-[#F8FAFD] items-center justify-center text-center"
          >
            <RefreshCw size={12} className={statsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        }
      >
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <ActivityStatCard label="Surveys Managed" value={statsLoading ? '—' : String(liveStats.surveysManaged)} color="text-[#0B4A8B]" />
          <ActivityStatCard label="Cases Handled" value={statsLoading ? '—' : String(liveStats.casesHandled)} color="text-[#17A673]" />
          <ActivityStatCard label="Average NPS" value={statsLoading ? '—' : (liveStats.averageNps == null ? '—' : String(liveStats.averageNps))} color="text-[#F5A623]" />
          <ActivityStatCard label="Team Members" value={statsLoading ? '—' : String(liveStats.teamMembers)} color="text-[#7C3AED]" />
        </div>
      </SettingsCard>
    </div>
  )
}

function ActivityStatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-[12px] p-6 min-h-[140px] text-center gap-2"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
    >
      <div
        className={`text-[28px] font-extrabold tabular leading-none ${color}`}
        style={{ letterSpacing: '-0.03em' }}
      >
        {value}
      </div>
      <div className="mt-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8FA0B5]">
        {label}
      </div>
    </div>
  )
}

// Local color helper (darkens a hex by a ratio) — used for the avatar gradient.
function shade(hex: string, ratio: number) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim())
  if (!m) return hex
  const adjust = (c: number) => {
    const v = ratio < 0
      ? Math.round(c * (1 + ratio))
      : Math.round(c + (255 - c) * ratio)
    return Math.max(0, Math.min(255, v))
  }
  const r = adjust(parseInt(m[1], 16))
  const g = adjust(parseInt(m[2], 16))
  const b = adjust(parseInt(m[3], 16))
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`
}
