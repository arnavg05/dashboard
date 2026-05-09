'use client'

import { useState } from 'react'
import { saveSavingsGoal, deleteSavingsGoal } from '@/actions/finance'
import type { SavingsGoal } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

export function SavingsGoalCard({ goal }: { goal: SavingsGoal }) {
  const [editing, setEditing] = useState(false)
  const [current, setCurrent] = useState(goal.current_amount)
  const pct = Math.min(100, (goal.current_amount / goal.target_amount) * 100)

  async function save() {
    const fd = new FormData()
    fd.set('id', goal.id)
    fd.set('name', goal.name)
    fd.set('target_amount', String(goal.target_amount))
    fd.set('current_amount', String(current))
    if (goal.target_date) fd.set('target_date', goal.target_date)
    await saveSavingsGoal(fd)
    setEditing(false)
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-sm">{goal.name}</p>
            {goal.target_date && <p className="text-xs text-muted-foreground">By {goal.target_date}</p>}
          </div>
          <button onClick={() => deleteSavingsGoal(goal.id)} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <Progress value={pct} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {editing ? (
            <div className="flex items-center gap-1">
              <Label className="text-xs">£</Label>
              <Input type="number" value={current} onChange={(e) => setCurrent(Number(e.target.value))} className="h-6 w-24 text-xs" />
              <Button size="sm" className="h-6 text-xs px-2" onClick={save}>Save</Button>
            </div>
          ) : (
            <button className="hover:underline" onClick={() => setEditing(true)}>
              £{goal.current_amount.toLocaleString()} / £{goal.target_amount.toLocaleString()}
            </button>
          )}
          <span>{Math.round(pct)}%</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function AddSavingsGoalForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await saveSavingsGoal(new FormData(e.currentTarget))
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="goal-name">Goal name</Label>
        <Input id="goal-name" name="name" placeholder="Emergency fund" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="goal-target">Target (£)</Label>
          <Input id="goal-target" name="target_amount" type="number" step="0.01" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="goal-current">Saved so far (£)</Label>
          <Input id="goal-current" name="current_amount" type="number" step="0.01" defaultValue="0" />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="goal-date">Target date</Label>
        <Input id="goal-date" name="target_date" type="date" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Adding…' : 'Add Savings Goal'}
      </Button>
    </form>
  )
}
