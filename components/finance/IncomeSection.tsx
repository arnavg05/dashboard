'use client'

import { useState } from 'react'
import { saveIncomeSource, logIncome } from '@/actions/finance'
import type { IncomeSource } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Calendar, PlusCircle } from 'lucide-react'

function getNextPayDate(payDay: number): string {
  const today = new Date()
  let next = new Date(today.getFullYear(), today.getMonth(), payDay)
  if (next <= today) next = new Date(today.getFullYear(), today.getMonth() + 1, payDay)
  return next.toISOString().split('T')[0]
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().setHours(0,0,0,0)
  return Math.ceil(diff / 86400000)
}

export function IncomeSection({ incomeSources }: { incomeSources: IncomeSource[] }) {
  const [showAddSource, setShowAddSource] = useState(false)
  const [logSourceId, setLogSourceId] = useState('')
  const [logAmount, setLogAmount] = useState('')
  const [pending, setPending] = useState(false)

  async function handleAddSource(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await saveIncomeSource(new FormData(e.currentTarget))
    ;(e.target as HTMLFormElement).reset()
    setShowAddSource(false)
    setPending(false)
  }

  async function handleLogIncome(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await logIncome(new FormData(e.currentTarget))
    ;(e.target as HTMLFormElement).reset()
    setLogSourceId('')
    setLogAmount('')
    setPending(false)
  }

  return (
    <div className="space-y-4">
      {incomeSources.map((src) => {
        const nextPay = getNextPayDate(src.pay_day_of_month)
        const days = daysUntil(nextPay)
        return (
          <Card key={src.id}>
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{src.name}</p>
                <p className="text-xs text-muted-foreground">£{src.default_amount.toLocaleString()} on the {src.pay_day_of_month}th</p>
              </div>
              <Badge variant={days <= 3 ? 'default' : 'secondary'} className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days}d`}
              </Badge>
            </CardContent>
          </Card>
        )
      })}

      {/* Log income received */}
      {incomeSources.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Log Income Received</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleLogIncome} className="space-y-3">
              <div className="space-y-1">
                <Label>Source</Label>
                <Select value={logSourceId} onValueChange={(v) => { if (v) setLogSourceId(v) }} required>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    {incomeSources.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <input type="hidden" name="source_id" value={logSourceId} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="income-amount">Amount (£)</Label>
                  <Input id="income-amount" name="amount" type="number" step="0.01" value={logAmount}
                    onChange={(e) => setLogAmount(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="income-date">Date received</Label>
                  <Input id="income-date" name="received_on" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={pending || !logSourceId}>
                {pending ? 'Logging…' : 'Log Income'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Add income source */}
      {showAddSource ? (
        <Card>
          <CardHeader><CardTitle className="text-sm">Add Income Source</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddSource} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="src-name">Name</Label>
                <Input id="src-name" name="name" placeholder="Job 1" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="src-amount">Default amount (£)</Label>
                  <Input id="src-amount" name="default_amount" type="number" step="0.01" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="src-day">Pay day of month</Label>
                  <Input id="src-day" name="pay_day_of_month" type="number" min="1" max="31" required />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={pending}>Add</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddSource(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setShowAddSource(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Income Source
        </Button>
      )}
    </div>
  )
}
