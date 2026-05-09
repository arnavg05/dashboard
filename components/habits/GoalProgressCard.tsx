'use client'

import { useState } from 'react'
import { updateGoalProgress, completeGoal } from '@/actions/habits'
import type { Goal } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

export function GoalProgressCard({ goal }: { goal: Goal }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(goal.current_value)
  const pct = goal.target_value ? Math.min(100, (goal.current_value / goal.target_value) * 100) : 0

  async function save() {
    await updateGoalProgress(goal.id, value)
    setEditing(false)
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{goal.title}</p>
            {goal.due_date && (
              <p className="text-xs text-muted-foreground">Due {goal.due_date}</p>
            )}
          </div>
          {!goal.completed && (
            <button
              onClick={() => completeGoal(goal.id)}
              className="text-muted-foreground hover:text-green-600 transition-colors"
              title="Mark complete"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
          )}
        </div>

        {goal.target_value ? (
          <>
            <Progress value={pct} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {editing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="h-6 w-20 text-xs"
                  />
                  <span>{goal.unit}</span>
                  <Button size="sm" className="h-6 text-xs px-2" onClick={save}>Save</Button>
                </div>
              ) : (
                <button className="hover:underline" onClick={() => setEditing(true)}>
                  {goal.current_value} / {goal.target_value} {goal.unit}
                </button>
              )}
              <span>{Math.round(pct)}%</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            {goal.completed ? 'Completed' : 'In progress'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
