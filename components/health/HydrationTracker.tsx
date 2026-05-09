'use client'

import { useState, useTransition } from 'react'
import { logHydration, updateWaterGoal } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const QUICK_AMOUNTS = [250, 500, 750]

interface Props {
  todayMl: number
  goalMl: number
}

export function HydrationTracker({ todayMl: initial, goalMl }: Props) {
  const [todayMl, setTodayMl] = useState(initial)
  const [custom, setCustom] = useState('')
  const [editingGoal, setEditingGoal] = useState(false)
  const [newGoal, setNewGoal] = useState(goalMl)
  const [, startTransition] = useTransition()

  const pct = Math.min(100, (todayMl / goalMl) * 100)
  const radius = 54
  const circ = 2 * Math.PI * radius
  const dash = circ * (1 - pct / 100)

  function add(ml: number) {
    startTransition(async () => {
      setTodayMl((v) => v + ml)
      await logHydration(ml)
    })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ring */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted-foreground/20" />
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke={pct >= 100 ? '#22c55e' : '#3b82f6'}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{(todayMl / 1000).toFixed(1)}L</span>
          <span className="text-xs text-muted-foreground">{Math.round(pct)}%</span>
        </div>
      </div>

      {/* Goal */}
      {editingGoal ? (
        <div className="flex items-center gap-2">
          <Input
            type="number" value={newGoal} onChange={(e) => setNewGoal(Number(e.target.value))}
            className="w-24 h-7 text-xs"
          />
          <span className="text-xs">ml</span>
          <Button size="sm" className="h-7 text-xs" onClick={() => { updateWaterGoal(newGoal); setEditingGoal(false) }}>
            Save
          </Button>
        </div>
      ) : (
        <button onClick={() => setEditingGoal(true)} className="text-xs text-muted-foreground hover:underline">
          Goal: {goalMl}ml
        </button>
      )}

      {/* Quick add */}
      <div className="flex gap-2">
        {QUICK_AMOUNTS.map((ml) => (
          <Button key={ml} variant="outline" size="sm" onClick={() => add(ml)}>
            +{ml}ml
          </Button>
        ))}
      </div>

      {/* Custom */}
      <div className="flex gap-2 items-center">
        <Input
          type="number" placeholder="Custom ml" value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="w-28 h-8"
        />
        <Button
          variant="outline" size="sm"
          disabled={!custom}
          onClick={() => { add(Number(custom)); setCustom('') }}
        >
          Add
        </Button>
      </div>
    </div>
  )
}
