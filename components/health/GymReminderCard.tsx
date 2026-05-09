'use client'

import { useState } from 'react'
import { logGymCheckin } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'

export function GymReminderCard({ today }: { today: string }) {
  const [answered, setAnswered] = useState(false)
  const [went, setWent] = useState<boolean | null>(null)

  async function answer(didGo: boolean) {
    setWent(didGo)
    setAnswered(true)
    await logGymCheckin(today, didGo)
  }

  if (answered) {
    return (
      <Card className={went ? 'border-green-200 bg-green-50 dark:bg-green-950' : 'border-amber-200 bg-amber-50 dark:bg-amber-950'}>
        <CardContent className="pt-4 text-sm">
          {went ? '✓ Nice work — workout logged.' : 'Noted. There\'s always tomorrow.'}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
      <CardContent className="pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Dumbbell className="h-4 w-4" />
          Today is a gym day — did you go?
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={() => answer(true)}>Yes</Button>
          <Button size="sm" variant="outline" onClick={() => answer(false)}>No</Button>
        </div>
      </CardContent>
    </Card>
  )
}
