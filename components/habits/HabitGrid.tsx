'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleHabitCompletion, archiveHabit } from '@/actions/habits'
import type { Habit, HabitCompletion } from '@/types/database'
import { CheckCircle, Circle, Archive } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  habits: Habit[]
  completions: HabitCompletion[]
  today: string
}

export function HabitGrid({ habits, completions, today }: Props) {
  const [, startTransition] = useTransition()
  const completedIds = new Set(completions.map((c) => c.habit_id))

  const [optimisticDone, toggle] = useOptimistic(
    completedIds,
    (state, habitId: string) => {
      const next = new Set(state)
      if (next.has(habitId)) next.delete(habitId)
      else next.add(habitId)
      return next
    }
  )

  if (habits.length === 0) {
    return <p className="text-sm text-muted-foreground">No habits yet — add one below.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {habits.map((habit) => {
        const done = optimisticDone.has(habit.id)
        return (
          <div
            key={habit.id}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors',
              done ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'hover:bg-accent'
            )}
            onClick={() => {
              startTransition(() => {
                toggle(habit.id)
                toggleHabitCompletion(habit.id, today, done)
              })
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: habit.color ?? '#6b7280' }}
              />
              <span className={cn('text-sm font-medium', done && 'line-through text-muted-foreground')}>
                {habit.name}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {done
                ? <CheckCircle className="h-4 w-4 text-green-600" />
                : <Circle className="h-4 w-4 text-muted-foreground" />
              }
              <button
                type="button"
                className="ml-1 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation()
                  archiveHabit(habit.id)
                }}
                title="Archive habit"
              >
                <Archive className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
