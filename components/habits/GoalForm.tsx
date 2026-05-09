'use client'

import { useState } from 'react'
import { createGoal } from '@/actions/habits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GoalForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await createGoal(new FormData(e.currentTarget))
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Add Goal</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="goal-title">Goal</Label>
            <Input id="goal-title" name="title" placeholder="e.g. Run 100km" required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="goal-target">Target</Label>
              <Input id="goal-target" name="target_value" type="number" placeholder="100" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="goal-unit">Unit</Label>
              <Input id="goal-unit" name="unit" placeholder="km" />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="goal-due">Due date</Label>
            <Input id="goal-due" name="due_date" type="date" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="goal-desc">Notes</Label>
            <Textarea id="goal-desc" name="description" rows={2} />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Adding…' : 'Add Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
