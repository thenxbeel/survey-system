import PolicyTypeCard from './PolicyTypeCard'
import TouchpointCard from './TouchpointCard'
import TopThemes from './TopThemes'

export default function BottomAnalytics({ range = '30d', branch = 'all' }: { range?: string; branch?: string }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <PolicyTypeCard range={range} branch={branch} />
      <TouchpointCard range={range} branch={branch} />
      <TopThemes range={range} branch={branch} />
    </div>
  )
}
