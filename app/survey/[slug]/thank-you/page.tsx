'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2, Home, ShieldCheck } from 'lucide-react'

export default function ThankYouPage() {
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const [surveyTitle, setSurveyTitle] = useState<string | null>(null)

  useEffect(() => {
    // Fetch the survey title for a personalized thank-you message
    fetch(`/api/public/surveys/${slug}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json?.data?.title) setSurveyTitle(json.data.title)
      })
      .catch(() => { /* ignore — title is decorative */ })
  }, [slug])

  useEffect(() => {
    // 1. Setup MutationObserver for RTL detection
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && (m.attributeName === 'class' || m.attributeName === 'lang')) {
          const isRTL = document.documentElement.classList.contains('translated-rtl') || document.documentElement.lang === 'ar'
          document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
        }
      }
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'lang'] })

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

  const handleTranslate = () => {
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = 'ar';
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.href = `https://translate.google.com/translate?sl=en&tl=ar&u=${encodeURIComponent(window.location.href)}`;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F4F7FB] via-[#F4F7FB] to-[#EBF0F7]">
      {/* Hidden container for Google Translate widget */}
      <div id="google_translate_element" className="hidden" />
      {/* Top Utility Bar */}
      <div className="bg-[#4A5568] px-4 py-2 text-white/90 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center justify-center gap-y-2 text-[13px] font-semibold tracking-wide sm:justify-between lg:px-4">
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
          <button type="button" onClick={handleTranslate} className="flex items-center rounded-[6px] border border-white/30 px-3 py-1 text-[12px] font-bold transition-all hover:bg-white/10 cursor-pointer">
            العربية
          </button>
        </div>
      </div>

      {/* Branding bar */}
      <header className="bg-gradient-to-r from-[#06386F] to-[#0B4A8B] text-white shadow-md">
        <div className="mx-auto flex w-full items-center justify-center px-5 py-6 sm:py-8">
          <a href="https://www.takaful.ae/" target="_blank" rel="noopener noreferrer" className="group relative flex items-center justify-center py-1 transition-transform duration-500 hover:scale-110">
            <div
              className="absolute inset-0 z-0 opacity-40 blur-[32px] transition-opacity duration-500 group-hover:opacity-80"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.6) 0%, transparent 65%)'
              }}
            />
            <img 
              src="/adntc-logo.png" 
              alt="ADNTC" 
              className="relative z-10 h-[48px] w-auto drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)] sm:h-[56px]" 
            />
          </a>
        </div>
      </header>

      <main className="flex items-center justify-center px-5 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="w-full max-w-md rounded-[20px] border border-[#E2E8F3] bg-white p-8 text-center shadow-[0_12px_40px_rgba(13,27,46,0.10)]"
        >
          {/* Animated check */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#17A673] to-[#0F6866] shadow-[0_8px_24px_rgba(23,166,115,0.3)]"
          >
            <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2.5} />
          </motion.div>

          <h1 className="mb-3 text-[26px] font-extrabold tracking-tight text-[#0D1B2E]">
            Thank You!
          </h1>
          <p className="mb-2 text-[14.5px] leading-relaxed text-[#4A5568]">
            Your valuable feedback has been submitted successfully.
          </p>
          {surveyTitle && (
            <p className="mb-7 text-[12.5px] font-medium text-[#8FA0B5]">
              Response recorded for <span className="font-bold text-[#0B4A8B]">{surveyTitle}</span>
            </p>
          )}

          <div className="mx-auto max-w-[90%] rounded-[14px] border border-[#E2E8F3] bg-[#F8FAFD] px-5 py-4 shadow-sm">
            <p className="flex flex-col items-center justify-center gap-2 text-center text-[12px] font-medium leading-relaxed text-[#4A5568]">
              <ShieldCheck className="h-4 w-4 text-[#17A673]" />
              Your feedback is completely confidential and directly helps us improve our services.
            </p>
          </div>
        </motion.div>
      </main>

      <footer className="mt-auto py-8">
        <div className="mx-auto max-w-3xl px-5 text-center text-[11px] text-[#8FA0B5]">
          © {new Date().getFullYear()} Abu Dhabi National Takaful Co. P.S.C.
        </div>
      </footer>
    </div>
  )
}
