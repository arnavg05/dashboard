'use client'

import { useState } from 'react'
import { logWeight } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function WeightLogForm({ unit = 'kg' }: { unit?: string }) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    // Convert lbs → kg if needed
    if (unit === 'lbs') {
      const lbs = Number(fd.get('weight_kg'))
      fd.set('weight_kg', String(Math.round(lbs * 0.453592 * 100) / 100))
    }
    await logWeight(fd)
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="weight">Weight ({unit})</Label>
          <Input id="weight" name="weight_kg" type="number" step="0.1" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="weight-date">Date</Label>
          <Input id="weight-date" name="logged_at" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Logging…' : 'Log Weight'}
      </Button>
    </form>
  )
}
