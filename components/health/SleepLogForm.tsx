'use client'

import { useState } from 'react'
import { logSleep } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SleepLogForm() {
  const [pending, setPending] = useState(false)
  const [quality, setQuality] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    if (quality) fd.set('quality', quality)
    await logSleep(fd)
    ;(e.target as HTMLFormElement).reset()
    setQuality('')
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="bedtime">Bedtime</Label>
          <Input id="bedtime" name="bedtime" type="time" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="wake-time">Wake time</Label>
          <Input id="wake-time" name="wake_time" type="time" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="sleep-date">Date (night of)</Label>
          <Input id="sleep-date" name="sleep_date" type="date" defaultValue={new Date(Date.now() - 86400000).toISOString().split('T')[0]} />
        </div>
        <div className="space-y-1">
          <Label>Quality (1–5)</Label>
          <Select value={quality} onValueChange={(v) => { if (v) setQuality(v) }}>
            <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n} {'★'.repeat(n)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Logging…' : 'Log Sleep'}
      </Button>
    </form>
  )
}
