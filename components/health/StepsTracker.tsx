'use client'

import { useState, useTransition } from 'react'
import { updateStepsGoal } from '@/actions/health'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Props {
  todaySteps: number
  goal: number
}

export function StepsTracker({ todaySteps, goal }: Props) {
  const [editingGoal, setEditingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(goal)
  const [, startTransition] = useTransition()

  const pct = Math.min(100, (todaySteps / goal) * 100)
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dash = circ * (1 - pct / 100)
  const color = pct >= 100 ? '#22c55e' : pct >= 60 ? '#f97316' : '#3b82f6'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted-foreground/20" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{todaySteps.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">steps</span>
        </div>
      </div>

      {editingGoal ? (
        <div className="flex items-center gap-2">
          <Input type="number" value={newGoal} onChange={(e) => setNewGoal(Number(e.target.value))} className="w-28 h-7 text-xs" />
          <Button size="sm" className="h-7 text-xs" onClick={() => {
            startTransition(() => { updateStepsGoal(newGoal) })
            setEditingGoal(false)
          }}>
            Save
          </Button>
        </div>
      ) : (
        <button onClick={() => setEditingGoal(true)} className="text-xs text-muted-foreground hover:underline">
          Goal: {goal.toLocaleString()} steps
        </button>
      )}
    </div>
  )
}
