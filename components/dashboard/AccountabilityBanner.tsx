'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, XCircle } from 'lucide-react'
import type { AccountabilityAlert } from '@/lib/accountability'
import { cn } from '@/lib/utils'

export function AccountabilityBanner({ alerts }: { alerts: AccountabilityAlert[] }) {
  const [collapsed, setCollapsed] = useState(false)

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
        <CheckCircle className="h-4 w-4 shrink-0" />
        <span>Looking good — keep it up.</span>
      </div>
    )
  }

  const scolds = alerts.filter((a) => a.severity === 'scold')
  const warns = alerts.filter((a) => a.severity === 'warn')

  return (
    <div className={cn(
      'rounded-lg border text-sm overflow-hidden',
      scolds.length > 0
        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
        : 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800'
    )}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2 font-medium"
      >
        <div className="flex items-center gap-2">
          {scolds.length > 0
            ? <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
            : <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          }
          <span className={scolds.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'}>
            {alerts.length} thing{alerts.length > 1 ? 's' : ''} need{alerts.length === 1 ? 's' : ''} your attention
          </span>
        </div>
        {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>

      {!collapsed && (
        <div className="px-4 pb-3 space-y-1">
          {[...scolds, ...warns].map((alert, i) => (
            <div key={i} className={cn(
              'flex items-start gap-2',
              alert.severity === 'scold' ? 'text-red-700 dark:text-red-300' : 'text-amber-700 dark:text-amber-300'
            )}>
              <span className="font-semibold shrink-0">[{alert.area}]</span>
              <span>{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
