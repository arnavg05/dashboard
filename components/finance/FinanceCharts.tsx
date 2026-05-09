'use client'

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'
import type { Transaction } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PALETTE = ['#3b82f6','#ef4444','#22c55e','#f97316','#8b5cf6','#ec4899','#06b6d4','#eab308','#6366f1']

interface Props {
  transactions: Transaction[]
}

export function FinanceCharts({ transactions }: Props) {
  // Category breakdown for current month
  const categoryMap: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type === 'expense') categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount
  }
  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
    .sort((a, b) => b.value - a.value)

  // Monthly trend: last 6 months
  const monthMap: Record<string, { income: number; expense: number }> = {}
  for (const t of transactions) {
    const month = t.txn_date.slice(0, 7)
    if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 }
    if (t.type === 'income') monthMap[month].income += t.amount
    else monthMap[month].expense += t.amount
  }
  const barData = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, vals]) => ({ month: month.slice(5), ...vals }))

  return (
    <div className="space-y-4">
      {pieData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Spending by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(props: PieLabelRenderProps) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                </Pie>
                <Tooltip formatter={(v: unknown) => [`£${(v as number).toFixed(2)}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {barData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Monthly Income vs Expenses</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(v: unknown) => [`£${(v as number).toFixed(2)}`, '']} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
