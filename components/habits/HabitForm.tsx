'use client'

import { useState } from 'react'
import { createHabit } from '@/actions/habits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899']

export function HabitForm() {
  const [color, setColor] = useState(COLORS[0])
  const [frequency, setFrequency] = useState('daily')
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set('color', color)
    fd.set('frequency', frequency)
    await createHabit(fd)
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Add Habit</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="habit-name">Name</Label>
            <Input id="habit-name" name="name" placeholder="e.g. Morning run" required />
          </div>
          <div className="space-y-1">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => { if (v) setFrequency(v) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Colour</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: color === c ? 'black' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Adding…' : 'Add Habit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
