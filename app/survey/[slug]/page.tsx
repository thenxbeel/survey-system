'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  CheckCircle2, Clock, ShieldCheck,
  AlertTriangle, Loader2, Star, Send,
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PublicOption { id: number; value: string }
interface PublicQuestion {
  id: number
  question: string
  type: string
  required: boolean
  displayOrder: number
  options: PublicOption[]
}
interface PublicSurvey {
  slug: string
  surveyCode: string | null
  title: string
  description: string | null
  touchpoint: string
  category: string | null
  isAnonymous: boolean
  requireContactInfo: boolean
  activationDate: string | null
  expirationDate: string | null
  lifecycleStatus: string
  campaign: { id: number; name: string; channel: string } | null
  questions: PublicQuestion[]
  estimatedMinutes: number
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PublicSurveyPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params.slug

  const [survey, setSurvey] = useState<PublicSurvey | null>(null)
  const [closedMessage, setClosedMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [contactInfo, setContactInfo] = useState({
    name: '', email: '', phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isArabic, setIsArabic] = useState(false)

  // ── Fetch survey ──
  const fetchSurvey = useCallback(async () => {
    setLoading(true)
    setError(null)
    setClosedMessage(null)
    try {
      const res = await fetch(`/api/public/surveys/${slug}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/survey/${slug}`)
          return
        }
        if (res.status === 404) {
          setError('Survey not found. Please check your link and try again.')
        } else if (res.status === 410) {
          setClosedMessage(
            json.data?.closedMessage
              || 'This survey is no longer accepting responses. Thank you for your interest.'
          )
        } else {
          setError(json.error || 'Unable to load the survey.')
        }
        return
      }
      setSurvey(json.data)
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetchSurvey() }, [fetchSurvey])

  const questions = useMemo(() => survey?.questions ?? [], [survey])
  const totalQuestions = questions.length
  const answeredCount = useMemo(
    () => questions.filter(q => answers[q.id]?.trim()).length,
    [questions, answers],
  )
  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0

  // ── Translation ──
  useEffect(() => {
    // 1. Setup MutationObserver for RTL detection
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'lang')) {
          const isRTL = document.documentElement.classList.contains('translated-rtl') || document.documentElement.lang === 'ar'
          document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
          setIsArabic(isRTL)
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] })
    
    // Check initial state
    const isInitiallyRTL = document.documentElement.classList.contains('translated-rtl') || document.documentElement.lang === 'ar'
    setIsArabic(isInitiallyRTL)

    // 2. Inject Google Translate script
    if (!document.getElementById('google-translate-script')) {
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'en', includedLanguages: 'ar,en', autoDisplay: false },
          'google_translate_element'
        );
      };
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }
    
    return () => observer.disconnect()
  }, []);

  const handleTranslate = useCallback(() => {
    const nextLang = isArabic ? 'en' : 'ar';
    const nextCookie = isArabic ? '/en/en' : '/en/ar';
    
    // Force cookie for immediate recognition
    document.cookie = `googtrans=${nextCookie}; path=/`;
    document.cookie = `googtrans=${nextCookie}; domain=${window.location.hostname}; path=/`;

    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = nextLang;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Google Translate lazy-loads dictionaries. Fire again shortly after to ensure it applies immediately
      setTimeout(() => {
        if (select.value !== nextLang) select.value = nextLang;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }, 400);
    } else {
      console.warn("Translation widget not fully loaded yet.");
      // We don't reload to preserve state, just hope the Google translate script picks up the cookie
      if ((window as any).google && (window as any).google.translate) {
         new (window as any).google.translate.TranslateElement(
            { pageLanguage: 'en', includedLanguages: 'ar,en', autoDisplay: false },
            'google_translate_element'
          );
      }
    }
  }, [isArabic]);

  // Contact info is always optional — no customer record is ever created.
  // The provided name/email/phone is stored directly on the Response row.

  // ── Answer handlers ──
  function setAnswer(qId: number, value: string) {
    setAnswers(prev => ({ ...prev, [qId]: value }))
  }

  // ── Auto-advance ──
  const handleAutoAdvance = useCallback((currentIndex: number) => {
    // Wait for the visual selection animation to complete before scrolling
    setTimeout(() => {
      const nextElement = document.getElementById(`question-${currentIndex + 1}`)
      if (nextElement) {
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        const contactElement = document.getElementById('contact-info')
        if (contactElement) {
          contactElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 350)
  }, [])

  function canSubmit() {
    if (!survey) return false
    // All required questions must be answered
    const missingRequired = questions.some(q => q.required && !answers[q.id]?.trim())
    if (missingRequired) return false
    // If identified AND requireContactInfo, at least one contact method must be present
    if (!survey.isAnonymous && survey.requireContactInfo) {
      if (!contactInfo.email && !contactInfo.phone) return false
    }
    return true
  }

  async function handleSubmit() {
    if (!survey || !canSubmit()) return
    setSubmitting(true)
    setSubmitError(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\d+$/
    const isEmailInvalid = contactInfo.email && !emailRegex.test(contactInfo.email)
    const isPhoneInvalid = contactInfo.phone && !phoneRegex.test(contactInfo.phone)

    if (isEmailInvalid && isPhoneInvalid) {
      setSubmitError('Email and phone invalid')
      setSubmitting(false)
      return
    } else if (isEmailInvalid) {
      setSubmitError('Invalid email address')
      setSubmitting(false)
      return
    } else if (isPhoneInvalid) {
      setSubmitError('Invalid phone number')
      setSubmitting(false)
      return
    }

    // Identified + requireContactInfo: name + at least one contact method required
    if (!survey.isAnonymous && survey.requireContactInfo) {
      if (!contactInfo.name && !contactInfo.email && !contactInfo.phone) {
        setSubmitError('Please provide at least one contact method (Name, Email, or Phone).')
        setSubmitting(false)
        return
      }
      if (!contactInfo.email && !contactInfo.phone) {
        setSubmitError('Please provide at least one contact method (Email or Phone).')
        setSubmitting(false)
        return
      }
    }

    try {
      const payload: Record<string, unknown> = {
        answers: questions.map(q => ({
          questionId: q.id,
          answer: answers[q.id] ?? '',
        })),
        distributionChannel: survey.campaign?.channel || 'WEB',
      }

      // Extract NPS score if any NPS question was answered
      const npsQ = questions.find(q => q.type === 'nps')
      if (npsQ && answers[npsQ.id]) {
        payload.npsScore = parseInt(answers[npsQ.id], 10)
      }

      // Collect feedback from long_answer questions
      const feedbackQ = questions.find(q => q.type === 'long_answer')
      if (feedbackQ && answers[feedbackQ.id]) {
        payload.feedback = answers[feedbackQ.id]
      }

      // Optional contact info — stored on the Response row only.
      // NO customer record is ever created.
      if (contactInfo.name)  payload.customerName  = contactInfo.name
      if (contactInfo.email) payload.customerEmail = contactInfo.email
      if (contactInfo.phone) payload.customerPhone = contactInfo.phone

      const res = await fetch(`/api/public/surveys/${slug}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (res.status === 201) {
        if (isArabic) {
          window.location.href = `/survey/${slug}/thank-you`
        } else {
          router.push(`/survey/${slug}/thank-you`)
        }
        return
      }
      if (res.status === 409) {
        setSubmitError(json.error || 'You have already submitted a response.')
        return
      }
      if (res.status === 410) {
        setClosedMessage(json.error || 'This survey is no longer accepting responses.')
        return
      }
      setSubmitError(json.error || 'Submission failed. Please try again.')
    } catch {
      setSubmitError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render: loading ──
  if (loading) {
    return (
      <PublicSurveyShell onTranslate={handleTranslate} isArabic={isArabic}>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#0B4A8B]" />
          <p className="text-[13px] text-[#8FA0B5]">Loading survey…</p>
        </div>
      </PublicSurveyShell>
    )
  }

  // ── Render: closed / expired ──
  if (closedMessage) {
    return (
      <PublicSurveyShell onTranslate={handleTranslate} isArabic={isArabic}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
            <AlertTriangle className="h-7 w-7 text-[#E5484D]" />
          </div>
          <h1 className="mb-2 text-[20px] font-bold text-[#0D1B2E]">Survey Closed</h1>
          <p className="max-w-md text-[13.5px] leading-relaxed text-[#4A5568]">{closedMessage}</p>
        </div>
      </PublicSurveyShell>
    )
  }

  // ── Render: error ──
  if (error || !survey) {
    return (
      <PublicSurveyShell onTranslate={handleTranslate} isArabic={isArabic}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FEF2F2]">
            <AlertTriangle className="h-7 w-7 text-[#E5484D]" />
          </div>
          <h1 className="mb-2 text-[20px] font-bold text-[#0D1B2E]">Unable to Load Survey</h1>
          <p className="max-w-md text-[13.5px] leading-relaxed text-[#4A5568]">
            {error || 'An unexpected error occurred.'}
          </p>
        </div>
      </PublicSurveyShell>
    )
  }

  // ── Render: survey (ALL questions on one page) ──
  return (
    <PublicSurveyShell survey={survey} answeredCount={answeredCount} totalQuestions={totalQuestions} progress={progress} onTranslate={handleTranslate} isArabic={isArabic}>
      {/* Welcome card */}
      <div className="relative overflow-hidden flex flex-col gap-4 rounded-[20px] border border-[#E2E8F3] bg-white/90 backdrop-blur-md p-5 shadow-[0_4px_24px_rgba(13,27,46,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-8 hover:shadow-[0_8px_30px_rgba(13,27,46,0.08)] transition-all duration-300">
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#0B4A8B]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#EFF6FF]">
            <Send className="h-5 w-5 -rotate-45 text-[#0B4A8B]" />
          </span>
          <div>
            <h2 className="text-[16px] font-bold text-[#0D1B2E]">We value your feedback</h2>
            <p className="text-[13px] text-[#4A5568]">
              Please take a few moments to share your experience with us.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3.5 sm:border-s sm:border-[#E2E8F3] sm:ps-6">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#ECFDF5]">
            <ShieldCheck className="h-5 w-5 text-[#17A673]" />
          </span>
          <div>
            <p className="text-[13px] font-bold text-[#0D1B2E]">Your feedback helps us improve</p>
            <p className="text-[12px] text-[#4A5568]">Thank you for your time.</p>
          </div>
        </div>
      </div>

      {/* All question cards — vertical stack */}
      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          id={`question-${idx}`}
          number={idx + 1}
          question={q}
          value={answers[q.id] ?? ''}
          onChange={(v) => setAnswer(q.id, v)}
          onAutoAdvance={() => handleAutoAdvance(idx)}
        />
      ))}

      {/* Contact info section — after all questions */}
      <div id="contact-info" className="relative overflow-hidden rounded-[20px] border border-[#E2E8F3] bg-white/90 backdrop-blur-md p-5 shadow-[0_4px_24px_rgba(13,27,46,0.04)] sm:p-8 hover:shadow-[0_8px_30px_rgba(13,27,46,0.08)] transition-all duration-300">
        <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-gradient-to-tl from-[#17A673]/10 to-transparent blur-2xl pointer-events-none" />
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ECFDF5]">
            <ShieldCheck className="h-4 w-4 text-[#17A673]" />
          </span>
          <h3 className="text-[14px] font-bold text-[#0D1B2E]">
            {!survey.isAnonymous && survey.requireContactInfo ? 'Contact Info' : 'Optional Contact Info'}
          </h3>
          <span className={`ms-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider ${
            !survey.isAnonymous && survey.requireContactInfo
              ? 'bg-[#EBF5FF] text-[#0B4A8B]'
              : 'bg-[#F4F7FB] text-[#6B7A90]'
          }`}>
            {!survey.isAnonymous && survey.requireContactInfo ? 'Required' : 'Optional'}
          </span>
        </div>
        <p className="mb-6 ps-9 text-[13px] leading-relaxed text-[#6B7A90]">
          {!survey.isAnonymous && survey.requireContactInfo
            ? "Please provide your contact details so we can follow up with you. Your information is kept confidential."
            : "Share your contact details if you'd like us to follow up. Your information is kept confidential and stored only with this response."}
        </p>
        <div className="grid grid-cols-1 gap-4 ps-0 sm:grid-cols-3 sm:ps-9">
          <CustomerInput label="Full Name" value={contactInfo.name}
            onChange={(v) => setContactInfo(p => ({ ...p, name: v }))} />
          <CustomerInput label="Email Address" type="email" value={contactInfo.email}
            onChange={(v) => setContactInfo(p => ({ ...p, email: v }))} />
          <CustomerInput label="Phone Number" type="tel" value={contactInfo.phone}
            onChange={(v) => setContactInfo(p => ({ ...p, phone: v }))} />
        </div>
        <div className="mt-5 ps-0 sm:ps-9">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#F4F7FB] px-3 py-1.5 text-[11px] font-medium text-[#6B7A90]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#17A673]" />
            Your information is secure and will never be shared.
          </p>
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-[12.5px] text-[#E5484D]">
          <span>{submitError}</span>
        </div>
      )}

      {/* Submit section — split card: message left, button right */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-[#E2E8F3] bg-white/90 backdrop-blur-md p-5 shadow-[0_4px_24px_rgba(13,27,46,0.04)] sm:flex-row sm:items-center sm:justify-between sm:p-6 hover:shadow-[0_8px_30px_rgba(13,27,46,0.08)] transition-all duration-300">
        <div className="flex items-center gap-2 text-[12.5px] font-medium text-[#4A5568]">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#0B4A8B]" />
          {!canSubmit()
            ? <span>Please answer all required questions before submitting.</span>
            : <span>Please review your responses before submitting.</span>}
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          aria-disabled={!canSubmit() || submitting}
          className={`flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-[10px] px-8 text-[14px] font-bold text-white shadow-sm transition-all active:scale-[0.98] sm:w-auto ${
            canSubmit() && !submitting
              ? 'bg-[#0B4A8B] hover:bg-[#06386F] hover:shadow-md hover:-translate-y-0.5'
              : 'cursor-not-allowed bg-[#0B4A8B]/50'
          }`}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Submitting…</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Submit Response</span>
            </>
          )}
        </button>
      </div>
    </PublicSurveyShell>
  )
}

// ─── Question Card ──────────────────────────────────────────────────────────

function QuestionCard({
  id, number, question, value, onChange, onAutoAdvance
}: {
  id?: string
  number: number
  question: PublicQuestion
  value: string
  onChange: (v: string) => void
  onAutoAdvance?: () => void
}) {
  const isAnswered = !!value.trim()
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: number * 0.1, type: 'spring', stiffness: 200, damping: 25 }}
      className="relative overflow-hidden rounded-[20px] border border-[#E2E8F3] bg-white/80 p-5 backdrop-blur-md transition-all duration-300 sm:p-8 scroll-m-6 hover:shadow-[0_8px_30px_rgba(13,27,46,0.08)]"
      style={
        isAnswered 
          ? { borderColor: '#17A673', boxShadow: '0 8px 30px rgba(23,166,115,0.12), 0 0 0 1px #17A673', backgroundColor: 'rgba(255, 255, 255, 0.95)' }
          : { boxShadow: '0 4px 24px rgba(13,27,46,0.04)' }
      }
    >
      {isAnswered && (
        <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br from-[#17A673]/20 to-transparent blur-xl pointer-events-none" />
      )}
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#0B4A8B] text-[12px] font-bold text-white shadow-sm">
          {number}
        </span>
        <h3 className="flex-1 text-[14px] font-bold leading-snug text-[#0D1B2E]">
          {question.question}
        </h3>
        {question.required && (
          <span className="mt-0.5 rounded-full bg-[#FEF2F2] px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#E5484D]">
            Required
          </span>
        )}
      </div>
      <div className="ps-0 sm:ps-9">
        <QuestionInput question={question} value={value} onChange={onChange} onAutoAdvance={onAutoAdvance} />
      </div>
    </motion.div>
  )
}

function QuestionInput({
  question, value, onChange, onAutoAdvance
}: {
  question: PublicQuestion
  value: string
  onChange: (v: string) => void
  onAutoAdvance?: () => void
}) {
  const baseInput = "w-full rounded-[12px] border border-[#E2E8F3] bg-[#F8FAFD] px-4 py-3.5 text-[14px] text-[#0D1B2E] rtl:text-right ltr:text-left outline-none transition-all focus:border-[#0B4A8B] focus:bg-white focus:ring-4 focus:ring-[#0B4A8B]/10 focus:shadow-sm placeholder:text-[#B0BDCC]"

  switch (question.type) {
    case 'nps': {
      const selected = value ? parseInt(value, 10) : null
      return (
        <div>
          <div className="flex flex-wrap justify-center gap-2 sm:grid sm:grid-cols-11 sm:gap-2.5">
            {Array.from({ length: 11 }, (_, i) => i).map(score => {
              const isActive = selected === score
              const colorClass =
                score <= 6 ? 'bg-white text-[#E5484D] border-[#FECACA] hover:bg-[#FEF2F2] hover:border-[#F87171]'
                : score <= 8 ? 'bg-white text-[#D97706] border-[#FDE68A] hover:bg-[#FFFBEB] hover:border-[#FBBF24]'
                : 'bg-white text-[#17A673] border-[#A7F3D0] hover:bg-[#ECFDF5] hover:border-[#34D399]'
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => {
                    onChange(String(score))
                    onAutoAdvance?.()
                  }}
                  className={`w-[calc(16.666%-8px)] sm:w-full flex h-[44px] sm:h-[52px] items-center justify-center rounded-[12px] sm:rounded-[14px] border-2 text-[14px] sm:text-[15px] font-bold transition-all duration-200 ${
                    isActive 
                      ? '!bg-[#0B4A8B] !text-white !border-[#0B4A8B] scale-[1.08] shadow-md' 
                      : `${colorClass} shadow-sm hover:scale-[1.03]`
                  }`}
                >
                  {score}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10.5px] font-medium text-[#8FA0B5]">
            <span>0 — Very Unlikely</span>
            <span>10 — Very Likely</span>
          </div>
        </div>
      )
    }

    case 'short_answer':
    case 'email':
    case 'phone':
    case 'date':
      return (
        <input
          type={
            question.type === 'email' ? 'email'
            : question.type === 'phone' ? 'tel'
            : question.type === 'date' ? 'date'
            : 'text'
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer…"
          className={baseInput}
        />
      )

    case 'long_answer':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Share your thoughts in detail…"
          rows={4}
          className={`${baseInput} resize-none`}
        />
      )

    case 'yes_no':
      return (
        <div className="flex gap-2 sm:gap-3">
          {['Yes', 'No'].map(opt => {
            const isActive = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  onAutoAdvance?.()
                }}
                className={`flex-1 rounded-[10px] sm:rounded-[12px] border-2 px-4 sm:px-6 py-3 text-[13px] sm:text-[14px] font-bold transition-all duration-200 active:scale-[0.98] ${isActive ? 'border-[#0B4A8B] bg-[#EFF6FF] text-[#0B4A8B] shadow-sm' : 'border-[#E2E8F3] text-[#4A5568] hover:border-[#C8D4E3] hover:bg-[#F8FAFD]'}`}
              >
                {opt}
              </button>
            )
          })}
        </div>
      )

    case 'multiple_choice':
    case 'dropdown': {
      if (question.type === 'dropdown') {
        return (
          <select value={value} onChange={(e) => onChange(e.target.value)} className={baseInput}>
            <option value="">— Select an option —</option>
            {question.options.map(o => (
              <option key={o.id} value={o.value}>{o.value}</option>
            ))}
          </select>
        )
      }
      return (
        <div className="flex flex-col gap-2">
          {question.options.map(o => {
            const isActive = value === o.value
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.value)
                  if (question.type === 'multiple_choice') onAutoAdvance?.()
                }}
                className={`flex items-center gap-3 rounded-[12px] border-2 px-4 py-3.5 text-start text-[13.5px] sm:text-[14px] transition-all duration-200 active:scale-[0.99] ${isActive ? 'border-[#0B4A8B] bg-[#EFF6FF] text-[#0B4A8B] font-semibold shadow-sm' : 'border-[#E2E8F3] text-[#4A5568] hover:border-[#C8D4E3] hover:bg-[#F8FAFD]'}`}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${isActive ? 'border-[#0B4A8B] bg-[#0B4A8B]' : 'border-[#C8D4E3]'}`}>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                {o.value}
              </button>
            )
          })}
        </div>
      )
    }

    case 'checkbox':
      return (
        <div className="flex flex-col gap-2">
          {question.options.map(o => {
            const selected = value ? value.split('|') : []
            const isActive = selected.includes(o.value)
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  const next = isActive
                    ? selected.filter(v => v !== o.value)
                    : [...selected, o.value]
                  onChange(next.join('|'))
                }}
                className={`flex items-center gap-3 rounded-[12px] border-2 px-4 py-3.5 text-start text-[13.5px] sm:text-[14px] transition-all duration-200 active:scale-[0.99] ${isActive ? 'border-[#0B4A8B] bg-[#EFF6FF] text-[#0B4A8B] font-semibold shadow-sm' : 'border-[#E2E8F3] text-[#4A5568] hover:border-[#C8D4E3] hover:bg-[#F8FAFD]'}`}
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded-[4px] border-2 ${isActive ? 'border-[#0B4A8B] bg-[#0B4A8B] text-white' : 'border-[#C8D4E3]'}`}>
                  {isActive && <CheckCircle2 className="h-3 w-3" />}
                </span>
                {o.value}
              </button>
            )
          })}
        </div>
      )

    default:
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer…"
          className={baseInput}
        />
      )
  }
}

// ─── Contact info input ─────────────────────────────────────────────────────

function CustomerInput({
  label, value, onChange, type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block ps-1 text-[11px] font-bold uppercase tracking-wider text-[#8FA0B5]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[12px] border border-[#E2E8F3] bg-[#F8FAFD] px-4 py-3.5 text-[14px] font-medium text-[#0D1B2E] rtl:text-right ltr:text-left outline-none transition-all focus:border-[#0B4A8B] focus:bg-white focus:ring-4 focus:ring-[#0B4A8B]/10 focus:shadow-sm placeholder:text-[#B0BDCC]"
        placeholder={`Enter your ${label.toLowerCase()}`}
      />
    </label>
  )
}

// ─── Page shell with ADNTC branding ─────────────────────────────────────────

function PublicSurveyShell({
  survey, answeredCount = 0, totalQuestions = 0, progress = 0, onTranslate, isArabic, children,
}: {
  survey?: PublicSurvey | null
  answeredCount?: number
  totalQuestions?: number
  progress?: number
  onTranslate?: () => void
  isArabic?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-[#F4F7FB] overflow-hidden">
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" style={{ position: 'absolute', opacity: 0, zIndex: -1, width: 1, height: 1, overflow: 'hidden' }} />
      
      {/* Background aesthetic overlay (Subtle Islamic geometry) */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M40 0 L80 40 L40 80 L0 40Z' fill='none' stroke='%230B4A8B' stroke-width='1'/%3E%3Cpath d='M40 10 L70 40 L40 70 L10 40Z' fill='none' stroke='%230B4A8B' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='15' fill='none' stroke='%230B4A8B' stroke-width='0.5'/%3E%3Cpath d='M40 0 L40 80 M0 40 L80 40' stroke='%230B4A8B' stroke-width='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-[#EBF0F7]" />
      
      {/* Content Layer */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Utility Bar */}
      <div className="bg-[#4A5568] px-4 py-2 text-white/90 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-center gap-y-2 text-[13px] font-semibold tracking-wide sm:justify-between lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-8">
            <a href="tel:8002244" className="flex items-center gap-2 transition-colors hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              800 2244
            </a>
            <a href="mailto:customer.service@takaful.ae" className="flex items-center gap-2 transition-colors hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              customer.service@takaful.ae
            </a>
          </div>
          <button type="button" onClick={onTranslate} className="notranslate flex items-center rounded-[6px] border border-white/30 px-3 py-1 text-[12px] font-bold transition-all hover:bg-white/10 cursor-pointer">
            {isArabic ? 'English' : 'العربية'}
          </button>
        </div>
      </div>

      {/* Header — single blue block: logo row + title/progress row */}
      <header className="relative bg-gradient-to-r from-[#06386F] via-[#0B4A8B] to-[#06386F] text-white shadow-lg shadow-[#0B4A8B]/10 overflow-hidden">
        {/* Subtle animated background gradient for header */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
          <div className="flex items-center justify-center">
            <a href="https://www.takaful.ae/" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center py-1 transition-transform duration-500 hover:scale-105">
              <div
                className="absolute inset-0 z-0 opacity-40 blur-[32px] transition-opacity duration-500 group-hover:opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, transparent 65%)'
                }}
              />
              <img 
                src="/adntc-logo.png" 
                alt="ADNTC" 
                className="relative z-10 h-[40px] sm:h-[56px] w-auto drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all" 
              />
            </a>
          </div>
        </div>

        {survey && (
          <div className="border-t border-white/10">
            <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-5 lg:px-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[15px] font-bold sm:text-[17px]">
                    {survey.title}
                  </div>
                  <div className="mt-0.5 text-[13px] uppercase tracking-wide text-white/80">
                    {survey.surveyCode || survey.touchpoint}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:gap-6">
                  {totalQuestions > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="whitespace-nowrap text-[12px] font-semibold text-white/90">
                        {answeredCount} of {totalQuestions} answered
                      </span>
                      <div className="h-2 w-32 overflow-hidden rounded-full bg-white/20 sm:w-52">
                        <motion.div
                          className="h-full rounded-full bg-white"
                          initial={false}
                          animate={{ width: `${progress}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                        />
                      </div>
                      <span className="whitespace-nowrap text-[12px] font-semibold text-white">
                        {progress}% complete
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 rounded-[10px] bg-white/10 px-3.5 py-2 sm:px-4 w-fit">
                    <Clock className="h-4 w-4" />
                    <div className="leading-tight">
                      <div className="text-[13px] font-bold">{survey.estimatedMinutes} min</div>
                      <div className="text-[10px] text-white/70">Estimated time</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main content — elegantly constrained for optimal reading width */}
      <main className="mx-auto w-full max-w-[800px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F3] py-6">
        <div className="mx-auto max-w-[1600px] px-4 text-center text-[11px] text-[#8FA0B5] sm:px-6 lg:px-10">
          <p className="mb-1">
            © {new Date().getFullYear()} Abu Dhabi National Takaful Co. P.S.C. All rights reserved.
          </p>
          <p>
            Your feedback is confidential and used solely to improve our services.
          </p>
        </div>
      </footer>
      </div>
    </div>
  )
}
