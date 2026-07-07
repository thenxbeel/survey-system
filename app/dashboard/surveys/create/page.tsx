'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * /dashboard/surveys/create — legacy route.
 *
 * Survey creation now lives exclusively in the Survey Builder
 * (/dashboard/survey-builder). This route simply redirects there,
 * preserving the optional ?edit=<id> query string for future edit flows.
 *
 * No backend, API, validation, or Prisma logic is removed — the builder
 * still uses the same publish / save-draft handlers.
 *
 * useSearchParams() is wrapped in <Suspense> because Next.js 16 requires it
 * during static prerender.
 */
export default function CreateSurveyRedirect() {
  return (
    <Suspense fallback={null}>
      <RedirectInner />
    </Suspense>
  )
}

function RedirectInner() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const editId = params?.get('edit')
    const target = editId
      ? `/dashboard/survey-builder?edit=${encodeURIComponent(editId)}`
      : '/dashboard/survey-builder'
    router.replace(target)
  }, [router, params])

  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="text-center">
        <div className="mb-2 text-[14px] font-semibold" style={{ color: 'var(--text)' }}>
          Opening Survey Builder…
        </div>
        <div className="text-[12px]" style={{ color: 'var(--text-light)' }}>
          All surveys are now created in the Survey Builder.
        </div>
      </div>
    </div>
  )
}
