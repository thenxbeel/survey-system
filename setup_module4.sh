#!/bin/bash

# Create directories based on your exact folder tree
mkdir -p app/dashboard/analytics
mkdir -p components/analytics/layout
mkdir -p components/analytics/kpi
mkdir -p components/analytics/charts
mkdir -p components/analytics/assistant
mkdir -p components/analytics/builder
mkdir -p components/analytics/export
mkdir -p lib/mock-data
mkdir -p types

# 1. types/analytics.ts
cat << 'EOF' > types/analytics.ts
export interface KpiData {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  sparkline: number[];
}

export interface InsightData {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  trend: 'up' | 'down';
}

export interface TrendDataPoint {
  date: string;
  responses: number;
  completions: number;
}

export interface BarDataPoint {
  label: string;
  value: number;
}

export interface PieDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface HeatmapPoint {
  day: string;
  hour: string;
  value: number; // 0-4 intensity
}

export interface RadarDataPoint {
  metric: string;
  value: number; // 0-100
}

export interface ScatterDataPoint {
  x: number; // e.g., time in minutes
  y: number; // e.g., completion rate %
  label: string;
}

export type ChartType = 'line' | 'bar' | 'pie' | 'scatter' | 'radar' | 'heatmap';
export type MetricType = 'responses' | 'completions' | 'time' | 'rate';
export type GroupByType = 'date' | 'survey' | 'category' | 'status';
export type FilterType = 'all' | 'active' | 'completed' | 'draft';

export interface VisualizationConfig {
  chartType: ChartType;
  metric: MetricType;
  groupBy: GroupByType;
  filter: FilterType;
}

export interface WidgetConfig {
  id: string;
  title: string;
  description?: string;
  chartType: ChartType;
  w: number; // 1-4 grid columns
  h: number; // 1-2 grid rows
}
EOF

# 2. lib/mock-data/analytics.ts
cat << 'EOF' > lib/mock-data/analytics.ts
import { 
  KpiData, InsightData, TrendDataPoint, BarDataPoint, PieDataPoint, 
  HeatmapPoint, RadarDataPoint, ScatterDataPoint 
} from '@/types/analytics';

export const mockKpis: KpiData[] = [
  { id: 'total-responses', title: 'Total Responses', value: '24,891', change: 12.5, trend: 'up', sparkline: [20, 35, 25, 45, 35, 55, 65, 60, 75, 80] },
  { id: 'completion-rate', title: 'Completion Rate', value: '87.4%', change: 4.2, trend: 'up', sparkline: [60, 62, 65, 63, 68, 70, 75, 78, 82, 87] },
  { id: 'avg-time', title: 'Avg. Completion Time', value: '4m 12s', change: -8.1, trend: 'down', sparkline: [80, 75, 78, 70, 65, 60, 55, 50, 45, 42] },
  { id: 'active-surveys', title: 'Active Surveys', value: '42', change: 2.4, trend: 'up', sparkline: [30, 32, 35, 34, 38, 40, 39, 41, 40, 42] },
];

export const mockInsights: InsightData[] = [
  { id: 'insight-1', title: 'Completion Rate Drop Detected', description: 'The "Onboarding Feedback" survey saw a 15% drop in completion rate over the last 7 days, primarily on mobile devices.', impact: 'high', trend: 'down' },
  { id: 'insight-2', title: 'Peak Engagement Hours', description: 'Highest submission volume occurs between 2 PM and 4 PM on Tuesdays. Consider scheduling automated reminders during this window.', impact: 'medium', trend: 'up' },
  { id: 'insight-3', title: 'NPS Score Correlation', description: 'Surveys with fewer than 5 questions have a 22% higher NPS score compared to longer formats.', impact: 'high', trend: 'up' },
];

export const suggestedPrompts = ["What is the trend for completion rate?", "Show me active surveys", "Why did NPS drop last week?", "Compare mobile vs desktop responses"];

export const mockTrendData: TrendDataPoint[] = [
  { date: 'Jan', responses: 1200, completions: 1000 },
  { date: 'Feb', responses: 1400, completions: 1250 },
  { date: 'Mar', responses: 1100, completions: 950 },
  { date: 'Apr', responses: 1800, completions: 1600 },
  { date: 'May', responses: 2100, completions: 1900 },
  { date: 'Jun', responses: 1950, completions: 1750 },
  { date: 'Jul', responses: 2400, completions: 2200 },
  { date: 'Aug', responses: 2800, completions: 2600 },
];

export const mockBarData: BarDataPoint[] = [
  { label: 'NPS', value: 4200 }, { label: 'CSAT', value: 3800 }, { label: 'Onboarding', value: 3100 }, { label: 'Feedback', value: 2500 }, { label: 'Churn', value: 1800 },
];

export const mockPieData: PieDataPoint[] = [
  { label: 'Active', value: 45, color: 'hsl(262, 83%, 58%)' },
  { label: 'Completed', value: 30, color: 'hsl(142, 71%, 45%)' },
  { label: 'Draft', value: 15, color: 'hsl(38, 92%, 50%)' },
  { label: 'Archived', value: 10, color: 'hsl(220, 10%, 40%)' },
];

export const mockHeatmapData: HeatmapPoint[] = Array.from({ length: 7 * 24 }).map((_, i) => ({
  day: Math.floor(i / 24).toString(), hour: (i % 24).toString(), value: Math.floor(Math.random() * 5),
}));

export const mockRadarData: RadarDataPoint[] = [
  { metric: 'Acquisition', value: 85 }, { metric: 'Activation', value: 70 }, { metric: 'Retention', value: 92 }, { metric: 'Revenue', value: 65 }, { metric: 'Referral', value: 78 },
];

export const mockScatterData: ScatterDataPoint[] = [
  { x: 2, y: 95, label: 'Survey A' }, { x: 5, y: 88, label: 'Survey B' }, { x: 8, y: 75, label: 'Survey C' }, { x: 12, y: 60, label: 'Survey D' }, { x: 15, y: 45, label: 'Survey E' }, { x: 18, y: 30, label: 'Survey F' }, { x: 3, y: 92, label: 'Survey G' },
];
EOF

# 3. app/dashboard/analytics/page.tsx
cat << 'EOF' > app/dashboard/analytics/page.tsx
import { AnalyticsHeader } from '@/components/analytics/layout/AnalyticsHeader';
import { AnalyticsToolbar } from '@/components/analytics/layout/AnalyticsToolbar';
import { KpiGrid } from '@/components/analytics/kpi/KpiGrid';
import { InsightGrid } from '@/components/analytics/assistant/InsightGrid';
import { DashboardBuilder } from '@/components/analytics/builder/DashboardBuilder';
import { Sparkles } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <AnalyticsHeader />
      <AnalyticsToolbar />
      
      <main className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold tracking-tight text-foreground">Automated Insights</h2>
          </div>
          <InsightGrid />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Performance Overview</h2>
          <KpiGrid />
        </div>
        
        <DashboardBuilder />
      </main>
    </div>
  );
}
EOF

# 4. components/analytics/layout/AnalyticsHeader.tsx
cat << 'EOF' > components/analytics/layout/AnalyticsHeader.tsx
'use client';

import { useState } from 'react';
import { Download, Sparkles, Plus } from 'lucide-react';
import { AskAnalytics } from '../assistant/AskAnalytics';
import { VisualizationBuilder } from '../builder/VisualizationBuilder';
import { ExportCenter } from '../export/ExportCenter';

export function AnalyticsHeader() {
  const [askOpen, setAskOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Enterprise Analytics</h1>
          <p className="text-sm text-muted-foreground">Cross-survey insights, trends, and custom dashboards.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExportOpen(true)} className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium border border-border rounded-md hover:bg-accent">
            <Download className="mr-2 h-4 w-4" /> Export
          </button>
          <button onClick={() => setAskOpen(true)} className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium border border-violet-200 bg-violet-50 text-violet-700 rounded-md hover:bg-violet-100">
            <Sparkles className="mr-2 h-4 w-4" /> Ask Analytics
          </button>
          <button onClick={() => setBuilderOpen(true)} className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700">
            <Plus className="mr-2 h-4 w-4" /> New Visualization
          </button>
        </div>
      </div>

      <AskAnalytics open={askOpen} onOpenChange={setAskOpen} />
      <VisualizationBuilder open={builderOpen} onOpenChange={setBuilderOpen} />
      <ExportCenter open={exportOpen} onOpenChange={setExportOpen} />
    </>
  );
}
EOF

# 5. components/analytics/layout/AnalyticsToolbar.tsx
cat << 'EOF' > components/analytics/layout/AnalyticsToolbar.tsx
'use client';

import { useState } from 'react';
import { Calendar, ChevronDown, Filter } from 'lucide-react';

export function AnalyticsToolbar() {
  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
      <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full md:w-auto">
        {['overview', 'custom', 'builder'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all flex-1 ${tab === t ? 'bg-background text-foreground shadow' : 'hover:bg-background/50'}`}>
            {t === 'overview' ? 'Overview' : t === 'custom' ? 'Custom Dashboards' : 'Visualization Builder'}
          </button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center h-9 px-3 text-sm font-medium border border-border rounded-md hover:bg-accent">
          <Filter className="mr-2 h-4 w-4" /> All Surveys <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </button>
        <button className="inline-flex items-center h-9 px-3 text-sm font-medium border border-border rounded-md hover:bg-accent">
          <Calendar className="mr-2 h-4 w-4" /> Last 30 days <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
        </button>
      </div>
    </div>
  );
}
EOF

# 6. components/analytics/kpi/KpiCard.tsx
cat << 'EOF' > components/analytics/kpi/KpiCard.tsx
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { KpiData } from '@/types/analytics';
import { cn } from '@/lib/utils';

export function KpiCard({ kpi }: { kpi: KpiData }) {
  const isPositive = kpi.change >= 0;
  const changeColor = isPositive ? 'text-emerald-600' : 'text-red-600';

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
        <div className={cn('flex items-center text-xs font-semibold', changeColor)}>
          {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          {Math.abs(kpi.change)}%
        </div>
      </div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">{kpi.value}</div>
      <div className="mt-4 flex h-10 items-end gap-1">
        {kpi.sparkline.map((value, index) => (
          <div key={index} className="flex-1 rounded-sm bg-violet-200" style={{ height: `\${value}%` }} />
        ))}
      </div>
    </div>
  );
}
EOF

# 7. components/analytics/kpi/KpiGrid.tsx
cat << 'EOF' > components/analytics/kpi/KpiGrid.tsx
import { KpiCard } from './KpiCard';
import { mockKpis } from '@/lib/mock-data/analytics';

export function KpiGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {mockKpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
    </div>
  );
}
EOF

# 8. components/analytics/charts/ChartContainer.tsx
cat << 'EOF' > components/analytics/charts/ChartContainer.tsx
import { ReactNode } from 'react';
import { ChartLoadingSkeleton } from './ChartLoadingSkeleton';
import { EmptyState } from './EmptyState';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function ChartContainer({ title, description, children, className, isLoading = false, isEmpty = false }: ChartContainerProps) {
  return (
    <div className={`bg-card text-card-foreground border border-border rounded-xl flex flex-col p-6 \${className}`} role="region" aria-label={title}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="h-[300px] w-full">
        {isLoading ? <ChartLoadingSkeleton /> : isEmpty ? <EmptyState /> : children}
      </div>
    </div>
  );
}
EOF

# 9. components/analytics/charts/ChartLoadingSkeleton.tsx
cat << 'EOF' > components/analytics/charts/ChartLoadingSkeleton.tsx
export function ChartLoadingSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-1/3 bg-muted rounded" />
        <div className="h-4 w-1/4 bg-muted rounded" />
      </div>
      <div className="flex flex-1 items-end gap-2">
        <div className="h-full w-full bg-muted rounded" />
        <div className="h-3/4 w-full bg-muted rounded" />
        <div className="h-1/2 w-full bg-muted rounded" />
        <div className="h-4/5 w-full bg-muted rounded" />
        <div className="h-2/3 w-full bg-muted rounded" />
      </div>
    </div>
  );
}
EOF

# 10. components/analytics/charts/EmptyState.tsx
cat << 'EOF' > components/analytics/charts/EmptyState.tsx
import { Inbox } from 'lucide-react';

export function EmptyState({ title = "No Data Available", description = "Try adjusting your filters or date range to see results." }: { title?: string; description?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-[200px]">{description}</p>
    </div>
  );
}
EOF

# 11. components/analytics/charts/TrendChart.tsx
cat << 'EOF' > components/analytics/charts/TrendChart.tsx
import { mockTrendData } from '@/lib/mock-data/analytics';

export function TrendChart() {
  const data = mockTrendData;
  const maxVal = Math.max(...data.map(d => Math.max(d.responses, d.completions)));
  const w = 100, h = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.responses / maxVal) * h;
    return `\${x},\${y}`;
  }).join(' ');

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="hsl(262, 83%, 58%)" strokeWidth="2" vectorEffect="non-scaling-stroke" points={points} />
        <polygon fill="url(#grad)" points={`0,100 \${points} 100,100`} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-muted-foreground">
        {data.map(d => <span key={d.date}>{d.date}</span>)}
      </div>
    </div>
  );
}
EOF

# 12. components/analytics/charts/VolumeBarChart.tsx
cat << 'EOF' > components/analytics/charts/VolumeBarChart.tsx
import { mockBarData } from '@/lib/mock-data/analytics';

export function VolumeBarChart() {
  const data = mockBarData;
  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div className="flex h-full w-full items-end justify-between gap-2 pb-6">
      {data.map((d) => (
        <div key={d.label} className="flex h-full w-full flex-col items-center justify-end gap-2">
          <div className="text-[10px] font-medium text-muted-foreground">{d.value.toLocaleString()}</div>
          <div className="w-full rounded-t-md bg-violet-500 hover:bg-violet-600 transition-colors" style={{ height: `\${(d.value / maxVal) * 100}%` }} />
          <div className="text-[10px] text-muted-foreground">{d.label}</div>
        </div>
      ))}
    </div>
  );
}
EOF

# 13. components/analytics/charts/DistributionPieChart.tsx
cat << 'EOF' > components/analytics/charts/DistributionPieChart.tsx
import { mockPieData } from '@/lib/mock-data/analytics';

export function DistributionPieChart() {
  const data = mockPieData;
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  return (
    <div className="flex h-full w-full items-center justify-center gap-6">
      <div className="relative h-[180px] w-[180px]">
        <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
          {data.map((item, i) => {
            const percent = (item.value / total) * 100;
            const dashArray = `\${percent} \${100 - percent}`;
            const dashOffset = -cumulativePercent;
            cumulativePercent += percent;
            return <circle key={i} cx="18" cy="18" r="15.915" fill="none" stroke={item.color} strokeWidth="4" strokeDasharray={dashArray} strokeDashoffset={dashOffset} />;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

# 14. components/analytics/charts/ActivityHeatmap.tsx
cat << 'EOF' > components/analytics/charts/ActivityHeatmap.tsx
import { mockHeatmapData } from '@/lib/mock-data/analytics';
import { cn } from '@/lib/utils';

export function ActivityHeatmap() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const getColor = (value: number) => {
    if (value === 0) return 'bg-muted/50';
    if (value === 1) return 'bg-violet-200';
    if (value === 2) return 'bg-violet-300';
    if (value === 3) return 'bg-violet-500';
    return 'bg-violet-700';
  };

  return (
    <div className="flex h-full w-full flex-col gap-1 overflow-hidden">
      <div className="flex flex-1 gap-1">
        <div className="flex w-4 flex-col justify-around text-[9px] text-muted-foreground">
          {days.map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="grid flex-1 grid-flow-col grid-rows-7 gap-1">
          {mockHeatmapData.map((point, i) => (
            <div key={i} className={cn("rounded-sm", getColor(point.value))} title={`\${point.value} submissions`} />
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-1 pt-2 text-[9px] text-muted-foreground">
        <span>Less</span>
        <div className="h-3 w-3 rounded-sm bg-muted/50" />
        <div className="h-3 w-3 rounded-sm bg-violet-300" />
        <div className="h-3 w-3 rounded-sm bg-violet-500" />
        <div className="h-3 w-3 rounded-sm bg-violet-700" />
        <span>More</span>
      </div>
    </div>
  );
}
EOF

# 15. components/analytics/charts/PerformanceRadar.tsx
cat << 'EOF' > components/analytics/charts/PerformanceRadar.tsx
import { mockRadarData } from '@/lib/mock-data/analytics';

export function PerformanceRadar() {
  const data = mockRadarData;
  const numPoints = data.length;
  const angleStep = (Math.PI * 2) / numPoints;
  const radius = 40, center = 50;

  const getPoint = (value: number, i: number) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return `\${center + r * Math.cos(angle)},\${center + r * Math.sin(angle)}`;
  };

  const polygonPoints = data.map((d, i) => getPoint(d.value, i)).join(' ');

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full">
        {[20, 40, 60, 80, 100].map((r, i) => (
          <polygon key={i} points={data.map((_, idx) => getPoint(r, idx)).join(' ')} fill="none" stroke="hsl(220, 10%, 90%)" strokeWidth="0.5" />
        ))}
        {data.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="hsl(220, 10%, 90%)" strokeWidth="0.5" />;
        })}
        <polygon points={polygonPoints} fill="hsl(262, 83%, 58%)" fillOpacity="0.2" stroke="hsl(262, 83%, 58%)" strokeWidth="1.5" />
        {data.map((d, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelR = radius + 12;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          return <text key={i} x={x} y={y} fontSize="6" textAnchor="middle" alignmentBaseline="middle" fill="hsl(220, 10%, 40%)">{d.metric}</text>;
        })}
      </svg>
    </div>
  );
}
EOF

# 16. components/analytics/charts/CompletionScatter.tsx
cat << 'EOF' > components/analytics/charts/CompletionScatter.tsx
import { mockScatterData } from '@/lib/mock-data/analytics';

export function CompletionScatter() {
  const data = mockScatterData;
  const maxX = Math.max(...data.map(d => d.x));
  const maxY = Math.max(...data.map(d => d.y));

  return (
    <div className="relative h-full w-full pb-6 pl-6">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <line x1="0" y1="100" x2="100" y2="100" stroke="hsl(220, 10%, 90%)" strokeWidth="0.5" />
        <line x1="0" y1="0" x2="0" y2="100" stroke="hsl(220, 10%, 90%)" strokeWidth="0.5" />
        {data.map((d, i) => (
          <circle key={i} cx={(d.x / maxX) * 100} cy={100 - (d.y / maxY) * 100} r="1.5" fill="hsl(262, 83%, 58%)" className="hover:fill-violet-700 transition-colors" />
        ))}
      </svg>
      <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[10px] text-muted-foreground">
        <span>0m</span><span>{maxX}m+</span>
      </div>
      <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-[10px] text-muted-foreground">
        <span>100%</span><span>0%</span>
      </div>
    </div>
  );
}
EOF

# 17. components/analytics/assistant/InsightCard.tsx
cat << 'EOF' > components/analytics/assistant/InsightCard.tsx
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { InsightData } from '@/types/analytics';
import { cn } from '@/lib/utils';

export function InsightCard({ insight, className }: { insight: InsightData; className?: string }) {
  const isUp = insight.trend === 'up';
  const impactColor = insight.impact === 'high' ? 'text-red-600 bg-red-50' : insight.impact === 'medium' ? 'text-amber-600 bg-amber-50' : 'text-blue-600 bg-blue-50';

  return (
    <div className={cn("bg-card text-card-foreground border border-border rounded-xl p-5 flex flex-col gap-3 transition-shadow hover:shadow-md", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase", impactColor)}>{insight.impact} impact</span>
        </div>
        <div className={cn("flex items-center text-xs font-medium", isUp ? "text-emerald-600" : "text-red-600")}>
          {isUp ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
          {isUp ? 'Positive' : 'Negative'}
        </div>
      </div>
      <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
    </div>
  );
}
EOF

# 18. components/analytics/assistant/InsightGrid.tsx
cat << 'EOF' > components/analytics/assistant/InsightGrid.tsx
import { InsightCard } from './InsightCard';
import { mockInsights } from '@/lib/mock-data/analytics';

export function InsightGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mockInsights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
    </div>
  );
}
EOF

# 19. components/analytics/assistant/AskAnalytics.tsx
cat << 'EOF' > components/analytics/assistant/AskAnalytics.tsx
'use client';

import { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';
import { InsightCard } from './InsightCard';
import { mockInsights, suggestedPrompts } from '@/lib/mock-data/analytics';

interface AskAnalyticsProps { open: boolean; onOpenChange: (open: boolean) => void; }

export function AskAnalytics({ open, onOpenChange }: AskAnalyticsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof mockInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!open) return null;

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (!searchQuery) { setResults(null); return; }
    setIsLoading(true);
    setTimeout(() => { setResults(mockInsights); setIsLoading(false); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[10vh]">
      <div className="w-full max-w-[600px] bg-background rounded-xl shadow-xl border border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="h-5 w-5 text-violet-600" /> Ask Analytics</h2>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Ask a question about your data... (e.g., 'Why did responses drop?')"
              className="w-full h-11 pl-9 pr-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-violet-500"
              value={query} onChange={(e) => handleSearch(e.target.value)} autoFocus
            />
          </div>
        </div>
        <div className="px-4 pb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
          {!results && !isLoading && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggested Questions</p>
              {suggestedPrompts.map((prompt) => (
                <button key={prompt} onClick={() => handleSearch(prompt)} className="block w-full text-left px-4 py-2.5 text-sm border border-border rounded-md hover:bg-accent transition-colors">
                  {prompt}
                </button>
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
              <p className="text-xs text-muted-foreground">Analyzing data...</p>
            </div>
          )}
          {results && !isLoading && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">AI Generated Insights</p>
              {results.map(insight => <InsightCard key={insight.id} insight={insight} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
EOF

# 20. components/analytics/builder/VisualizationBuilder.tsx
cat << 'EOF' > components/analytics/builder/VisualizationBuilder.tsx
'use client';

import { useState } from 'react';
import { BarChart3, LineChart, PieChart, ScatterChart, Check, X } from 'lucide-react';
import { ChartContainer } from '../charts/ChartContainer';
import { TrendChart } from '../charts/TrendChart';
import { VolumeBarChart } from '../charts/VolumeBarChart';
import { DistributionPieChart } from '../charts/DistributionPieChart';
import { CompletionScatter } from '../charts/CompletionScatter';
import { VisualizationConfig, ChartType } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface VisualizationBuilderProps { open: boolean; onOpenChange: (open: boolean) => void; }

const chartOptions: { value: ChartType; label: string; icon: React.ElementType }[] = [
  { value: 'line', label: 'Trend', icon: LineChart },
  { value: 'bar', label: 'Bar', icon: BarChart3 },
  { value: 'pie', label: 'Pie', icon: PieChart },
  { value: 'scatter', label: 'Scatter', icon: ScatterChart },
];

export function VisualizationBuilder({ open, onOpenChange }: VisualizationBuilderProps) {
  const [config, setConfig] = useState<VisualizationConfig>({ chartType: 'line', metric: 'responses', groupBy: 'date', filter: 'all' });

  if (!open) return null;

  const renderPreview = () => {
    switch (config.chartType) {
      case 'line': return <TrendChart />;
      case 'bar': return <VolumeBarChart />;
      case 'pie': return <DistributionPieChart />;
      case 'scatter': return <CompletionScatter />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-[800px] bg-background rounded-xl shadow-xl border border-border flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Create Visualization</h2>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 overflow-y-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chart Type</label>
              <div className="grid grid-cols-4 gap-2">
                {chartOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button key={option.value} onClick={() => setConfig(prev => ({ ...prev, chartType: option.value }))}
                      className={cn("flex flex-col items-center justify-center gap-1 rounded-md border p-3 text-xs font-medium transition-colors",
                        config.chartType === option.value ? "border-violet-500 bg-violet-50 text-violet-700" : "border-border hover:bg-accent")}>
                      <Icon className="h-5 w-5" /> {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Metric</label>
              <select className="w-full h-9 px-3 border border-border rounded-md bg-background" value={config.metric} onChange={(e) => setConfig(prev => ({ ...prev, metric: e.target.value as VisualizationConfig['metric'] }))}>
                <option value="responses">Total Responses</option><option value="completions">Total Completions</option>
                <option value="time">Avg. Completion Time</option><option value="rate">Completion Rate</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <select className="w-full h-9 px-3 border border-border rounded-md bg-background" value={config.groupBy} onChange={(e) => setConfig(prev => ({ ...prev, groupBy: e.target.value as VisualizationConfig['groupBy'] }))}>
                <option value="date">Date / Time</option><option value="survey">Survey</option>
                <option value="category">Category</option><option value="status">Status</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filters</label>
              <div className="grid grid-cols-4 gap-1 bg-muted p-1 rounded-md">
                {['all', 'active', 'completed', 'draft'].map(f => (
                  <button key={f} onClick={() => setConfig(prev => ({ ...prev, filter: f as VisualizationConfig['filter'] }))} 
                    className={cn("text-xs font-medium py-1.5 rounded-md transition-colors", config.filter === f ? "bg-background text-foreground shadow" : "text-muted-foreground hover:bg-background/50")}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium">Live Preview</label>
            <div className="flex-1 rounded-lg border border-dashed border-border bg-muted/20 p-4">
              <ChartContainer title={`\${config.metric.replace(/^\w/, c => c.toUpperCase())} by \${config.groupBy}`} description={`Filter: \${config.filter}`} className="h-full border-0 shadow-none">
                {renderPreview()}
              </ChartContainer>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
          <button onClick={() => onOpenChange(false)} className="h-9 px-4 text-sm font-medium border border-border rounded-md hover:bg-accent">Cancel</button>
          <button onClick={() => onOpenChange(false)} className="inline-flex items-center h-9 px-4 text-sm font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700">
            <Check className="mr-2 h-4 w-4" /> Add to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
EOF

# 21. components/analytics/builder/DashboardWidget.tsx
cat << 'EOF' > components/analytics/builder/DashboardWidget.tsx
'use client';

import { ArrowLeft, ArrowRight, Maximize, Minimize, Copy, Trash2, GripVertical } from 'lucide-react';
import { ChartContainer } from '../charts/ChartContainer';
import { TrendChart } from '../charts/TrendChart';
import { VolumeBarChart } from '../charts/VolumeBarChart';
import { DistributionPieChart } from '../charts/DistributionPieChart';
import { PerformanceRadar } from '../charts/PerformanceRadar';
import { CompletionScatter } from '../charts/CompletionScatter';
import { ActivityHeatmap } from '../charts/ActivityHeatmap';
import { WidgetConfig } from '@/types/analytics';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  widget: WidgetConfig; isEditMode: boolean;
  onMove: (id: string, dir: 'left' | 'right') => void;
  onResize: (id: string, axis: 'w' | 'h', delta: number) => void;
  onDuplicate: (id: string) => void; onDelete: (id: string) => void;
}

export function DashboardWidget({ widget, isEditMode, onMove, onResize, onDuplicate, onDelete }: DashboardWidgetProps) {
  const renderChart = () => {
    switch (widget.chartType) {
      case 'line': return <TrendChart />;
      case 'bar': return <VolumeBarChart />;
      case 'pie': return <DistributionPieChart />;
      case 'scatter': return <CompletionScatter />;
      case 'radar': return <PerformanceRadar />;
      case 'heatmap': return <ActivityHeatmap />;
      default: return null;
    }
  };

  return (
    <div className={cn("bg-card text-card-foreground border border-border rounded-xl relative flex flex-col overflow-hidden transition-all h-full", isEditMode && "border-dashed border-violet-400 shadow-sm")}>
      {isEditMode && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-border bg-background/80 p-1 backdrop-blur-sm">
          <button className="p-1 cursor-grab" disabled aria-label="Drag widget"><GripVertical className="h-3.5 w-3.5" /></button>
          <div className="mx-1 h-4 w-px bg-border" />
          <button className="p-1 hover:bg-accent rounded" onClick={() => onMove(widget.id, 'left')}><ArrowLeft className="h-3.5 w-3.5" /></button>
          <button className="p-1 hover:bg-accent rounded" onClick={() => onMove(widget.id, 'right')}><ArrowRight className="h-3.5 w-3.5" /></button>
          <div className="mx-1 h-4 w-px bg-border" />
          <button className="p-1 hover:bg-accent rounded" onClick={() => onResize(widget.id, 'w', -1)}><Minimize className="h-3.5 w-3.5" /></button>
          <button className="p-1 hover:bg-accent rounded" onClick={() => onResize(widget.id, 'w', 1)}><Maximize className="h-3.5 w-3.5" /></button>
          <div className="mx-1 h-4 w-px bg-border" />
          <button className="p-1 hover:bg-accent rounded" onClick={() => onDuplicate(widget.id)}><Copy className="h-3.5 w-3.5" /></button>
          <button className="p-1 hover:bg-red-50 rounded text-red-500" onClick={() => onDelete(widget.id)}><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      )}
      <ChartContainer title={widget.title} description={widget.description} className="flex-1 border-0 shadow-none">{renderChart()}</ChartContainer>
    </div>
  );
}
EOF

# 22. components/analytics/builder/DashboardBuilder.tsx
cat << 'EOF' > components/analytics/builder/DashboardBuilder.tsx
'use client';

import { useState } from 'react';
import { Pencil, Check, Plus } from 'lucide-react';
import { DashboardWidget } from './DashboardWidget';
import { WidgetConfig } from '@/types/analytics';
import { cn } from '@/lib/utils';

const initialWidgets: WidgetConfig[] = [
  { id: 'w1', title: 'Response Trend', chartType: 'line', w: 2, h: 1 },
  { id: 'w2', title: 'Status Distribution', chartType: 'pie', w: 1, h: 1 },
  { id: 'w3', title: 'Volume by Category', chartType: 'bar', w: 1, h: 1 },
  { id: 'w4', title: 'Activity Heatmap', chartType: 'heatmap', w: 2, h: 1 },
  { id: 'w5', title: 'Completion Time', chartType: 'scatter', w: 1, h: 1 },
  { id: 'w6', title: 'Performance Radar', chartType: 'radar', w: 1, h: 1 },
];

export function DashboardBuilder() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(initialWidgets);

  const handleMove = (id: string, dir: 'left' | 'right') => {
    setWidgets(prev => {
      const index = prev.findIndex(w => w.id === id); if (index === -1) return prev;
      const newIndex = dir === 'left' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const newWidgets = [...prev];
      [newWidgets[index], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[index]];
      return newWidgets;
    });
  };

  const handleResize = (id: string, axis: 'w' | 'h', delta: number) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, [axis]: Math.min(4, Math.max(1, w[axis] + delta)) } : w));
  };

  const handleDuplicate = (id: string) => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === id); if (!widget) return prev;
      const newWidget = { ...widget, id: `w\${Date.now()}`, title: `\${widget.title} (Copy)` };
      const index = prev.findIndex(w => w.id === id); const newWidgets = [...prev];
      newWidgets.splice(index + 1, 0, newWidget); return newWidgets;
    });
  };

  const handleDelete = (id: string) => setWidgets(prev => prev.filter(w => w.id !== id));

  const handleAddWidget = () => {
    setWidgets(prev => [...prev, { id: `w\${Date.now()}`, title: 'New Visualization', chartType: 'bar', w: 1, h: 1 }]);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">My Custom Dashboard</h2>
          <p className="text-sm text-muted-foreground">{isEditMode ? 'Edit mode active. Adjust widgets as needed.' : 'Custom tailored view of key metrics.'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <button onClick={handleAddWidget} className="inline-flex items-center h-8 px-3 text-xs font-medium border border-border rounded-md hover:bg-accent">
              <Plus className="mr-2 h-3.5 w-3.5" /> Add Widget
            </button>
          )}
          <button onClick={() => setIsEditMode(!isEditMode)} className={cn("inline-flex items-center h-8 px-3 text-xs font-medium rounded-md", isEditMode ? "bg-violet-600 text-white hover:bg-violet-700" : "border border-border hover:bg-accent")}>
            {isEditMode ? <><Check className="mr-2 h-3.5 w-3.5" /> Save Layout</> : <><Pencil className="mr-2 h-3.5 w-3.5" /> Edit Layout</>}
          </button>
        </div>
      </div>
      <div className={cn("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4", isEditMode && "rounded-lg border border-dashed border-violet-200 p-4")}>
        {widgets.map((widget) => (
          <div key={widget.id} className={cn("transition-all", widget.w === 1 && "lg:col-span-1", widget.w === 2 && "lg:col-span-2", widget.w === 3 && "lg:col-span-3", widget.w === 4 && "lg:col-span-4", widget.h === 2 && "row-span-2")}>
            <DashboardWidget widget={widget} isEditMode={isEditMode} onMove={handleMove} onResize={handleResize} onDuplicate={handleDuplicate} onDelete={handleDelete} />
          </div>
        ))}
        {widgets.length === 0 && (
          <div className="col-span-full flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Your dashboard is empty</p>
              <button onClick={handleAddWidget} className="mt-4 inline-flex items-center h-8 px-3 text-xs font-medium border border-border rounded-md hover:bg-accent">
                <Plus className="mr-2 h-3.5 w-3.5" /> Add Your First Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
EOF

# 23. components/analytics/export/ExportCenter.tsx
cat << 'EOF' > components/analytics/export/ExportCenter.tsx
'use client';

import { useState } from 'react';
import { FileText, FileSpreadsheet, Image, CheckCircle2, Loader2, X, Search } from 'lucide-react';

interface ExportCenterProps { open: boolean; onOpenChange: (open: boolean) => void; }
type ExportFormat = 'pdf' | 'csv' | 'png';
type ExportStatus = 'idle' | 'exporting' | 'success';

export function ExportCenter({ open, onOpenChange }: ExportCenterProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [format, setFormat] = useState<ExportFormat | null>(null);
  const [search, setSearch] = useState('');

  if (!open) return null;

  const handleExport = (selectedFormat: ExportFormat) => {
    setFormat(selectedFormat); setStatus('exporting');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => { setStatus('idle'); setFormat(null); onOpenChange(false); }, 1500);
    }, 1500);
  };

  const formats = [
    { id: 'pdf', name: 'PDF Document', desc: 'Comprehensive visual report', icon: FileText, color: 'text-red-500' },
    { id: 'csv', name: 'CSV Spreadsheet', desc: 'Raw response data', icon: FileSpreadsheet, color: 'text-emerald-500' },
    { id: 'png', name: 'PNG Image', desc: 'Dashboard snapshot', icon: Image, color: 'text-blue-500' }
  ];

  const filteredFormats = formats.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-[10vh]">
      <div className="w-full max-w-[425px] bg-background rounded-xl shadow-xl border border-border overflow-hidden">
        {status === 'idle' && (
          <div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Export Analytics</h2>
              <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-accent rounded-md"><X className="h-4 w-4" /></button>
            </div>
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Search export formats..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-9 pl-9 pr-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
            </div>
            <div className="p-2 max-h-[300px] overflow-y-auto">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">Formats</p>
              {filteredFormats.map(f => (
                <button key={f.id} onClick={() => handleExport(f.id as ExportFormat)} className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-accent text-left">
                  <f.icon className={`h-5 w-5 \${f.color}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{f.name}</span>
                    <span className="text-xs text-muted-foreground">{f.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {(status === 'exporting' || status === 'success') && (
          <div className="flex flex-col items-center justify-center gap-4 p-10 min-h-[250px]">
            {status === 'exporting' ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Generating {format?.toUpperCase()} file...</p>
                  <p className="text-xs text-muted-foreground mt-1">Preparing your analytics data</p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Export Successful!</p>
                  <p className="text-xs text-muted-foreground mt-1">Your file has been downloaded.</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
EOF

echo "Module 4 files have been successfully generated and mapped to your exact folder tree!"