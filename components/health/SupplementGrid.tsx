'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleSupplement } from '@/actions/health'
import type { Supplement, SupplementLog } from '@/types/database'
import { CheckCircle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  supplements: Supplement[]
  logs: SupplementLog[]
  today: string
}

export function SupplementGrid({ supplements, logs, today }: Props) {
  const [, startTransition] = useTransition()
  const takenIds = new Set(logs.map((l) => l.supplement_id))

  const [optimisticTaken, toggle] = useOptimistic(
    takenIds,
    (state, id: string) => {
      const next = new Set(state)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    }
  )

  if (supplements.length === 0) {
    return <p className="text-sm text-muted-foreground">No supplements configured — add some below.</p>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {supplements.map((s) => {
        const taken = optimisticTaken.has(s.id)
        return (
          <div
            key={s.id}
            onClick={() => startTransition(() => {
              toggle(s.id)
              toggleSupplement(s.id, today, taken)
            })}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-lg border cursor-pointer select-none transition-colors',
              taken ? 'bg-green-50 dark:bg-green-950 border-green-200' : 'hover:bg-accent'
            )}
          >
            <div>
              <p className={cn('text-sm font-medium', taken && 'line-through text-muted-foreground')}>{s.name}</p>
              {s.dose && <p className="text-xs text-muted-foreground">{s.dose}</p>}
            </div>
            {taken
              ? <CheckCircle className="h-4 w-4 text-green-600" />
              : <Circle className="h-4 w-4 text-muted-foreground" />
            }
          </div>
        )
      })}
    </div>
  )
}
