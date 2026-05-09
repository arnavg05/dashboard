'use client'

import { useState } from 'react'
import { saveGymSchedule } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DAYS_OF_WEEK } from '@/lib/constants'
import { cn } from '@/lib/utils'

// DAYS_OF_WEEK = ['Mon','Tue','Wed','Thu','Fri','Sat'] → ISO 1–6
export function GymSchedulePrompt({ weekStart }: { weekStart: string }) {
  const [selected, setSelected] = useState<number[]>([])
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(dow: number) {
    setSelected((prev) => prev.includes(dow) ? prev.filter((d) => d !== dow) : [...prev, dow])
  }

  async function save() {
    setPending(true)
    await saveGymSchedule(weekStart, selected)
    setSaved(true)
    setPending(false)
  }

  if (saved) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950">
        <CardContent className="pt-4 text-sm text-green-700 dark:text-green-300">
          Gym days saved for this week: {selected.map((d) => DAYS_OF_WEEK[d - 1]).join(', ') || 'rest week'}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="text-sm text-blue-700 dark:text-blue-300">
          Plan your gym days for this week — which days are you going?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {DAYS_OF_WEEK.map((day, i) => {
            const dow = i + 1
            const on = selected.includes(dow)
            return (
              <button
                key={day}
                onClick={() => toggle(dow)}
                className={cn(
                  'px-3 py-1 rounded-full text-sm border transition-colors',
                  on ? 'bg-blue-600 text-white border-blue-600' : 'border-blue-300 text-blue-700 hover:bg-blue-100 dark:text-blue-300'
                )}
              >
                {day}
              </button>
            )
          })}
        </div>
        <Button size="sm" onClick={save} disabled={pending}>
          {pending ? 'Saving…' : 'Save plan'}
        </Button>
      </CardContent>
    </Card>
  )
}
