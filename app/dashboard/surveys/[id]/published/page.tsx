import SurveyPublishedClient from '@/components/dashboard/surveys/SurveyPublishedClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SurveyPublishedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <SurveyPublishedClient id={id} />
}
