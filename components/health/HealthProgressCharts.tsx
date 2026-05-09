'use client'

import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  weightLogs: { logged_at: string; weight_kg: number }[]
  sleepLogs: { sleep_date: string; duration_min: number; quality: number | null }[]
  steps: { step_date: string; steps: number }[]
  hydLogs: { logged_at: string; amount_ml: number }[]
  stepsGoal: number
}

// Aggregate hydration logs by date
function groupHydByDate(logs: { logged_at: string; amount_ml: number }[]) {
  const map: Record<string, number> = {}
  for (const l of logs) {
    const date = l.logged_at.split('T')[0]
    map[date] = (map[date] ?? 0) + l.amount_ml
  }
  return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ml]) => ({ date, litres: Math.round(ml / 100) / 10 }))
}

export function HealthProgressCharts({ weightLogs, sleepLogs, steps, hydLogs, stepsGoal }: Props) {
  const hydData = groupHydByDate(hydLogs)
  const sleepData = sleepLogs.map((l) => ({ date: l.sleep_date, hours: Math.round(l.duration_min / 6) / 10 }))
  const stepsData = steps.map((s) => ({ date: s.step_date, steps: s.steps }))
  const weightData = weightLogs.map((w) => ({ date: w.logged_at, weight: w.weight_kg }))

  const fmt = (d: string) => d.slice(5) // MM-DD

  return (
    <div className="space-y-4">
      {weightData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Weight (kg)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={35} />
                <Tooltip formatter={(v: unknown) => [`${v}kg`, 'Weight']} labelFormatter={(d) => fmt(String(d))} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {sleepData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Sleep (hours)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={25} />
                <Tooltip formatter={(v: unknown) => [`${v}h`, 'Sleep']} labelFormatter={(d) => fmt(String(d))} />
                <ReferenceLine y={8} stroke="#22c55e" strokeDasharray="4 2" />
                <Bar dataKey="hours" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {stepsData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Daily Steps</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(v: unknown) => [(v as number).toLocaleString(), 'Steps']} labelFormatter={(d) => fmt(String(d))} />
                <ReferenceLine y={stepsGoal} stroke="#22c55e" strokeDasharray="4 2" label={{ value: 'Goal', position: 'right', fontSize: 10 }} />
                <Bar dataKey="steps" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {hydData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Hydration (litres)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={hydData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tickFormatter={fmt} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={25} />
                <Tooltip formatter={(v: unknown) => [`${v}L`, 'Water']} labelFormatter={(d) => fmt(String(d))} />
                <Bar dataKey="litres" fill="#06b6d4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
