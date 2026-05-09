'use client'

import { useState } from 'react'
import { logWorkout } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { WORKOUT_TYPES } from '@/lib/constants'

export function WorkoutLogForm() {
  const [pending, setPending] = useState(false)
  const [type, setType] = useState(WORKOUT_TYPES[0])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set('type', type)
    await logWorkout(fd)
    ;(e.target as HTMLFormElement).reset()
    setType(WORKOUT_TYPES[0])
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label>Type</Label>
          <Select value={type} onValueChange={(v) => { if (v) setType(v as typeof type) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORKOUT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="duration">Duration (min)</Label>
          <Input id="duration" name="duration_min" type="number" min="1" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="intensity">Intensity (1–5)</Label>
          <Input id="intensity" name="intensity" type="number" min="1" max="5" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="workout-date">Date</Label>
          <Input id="workout-date" name="logged_at" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="workout-notes">Notes</Label>
        <Textarea id="workout-notes" name="notes" rows={2} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Logging…' : 'Log Workout'}
      </Button>
    </form>
  )
}
