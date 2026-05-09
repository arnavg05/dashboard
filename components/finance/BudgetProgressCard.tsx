import type { BudgetCategory, Transaction } from '@/types/database'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Props {
  categories: BudgetCategory[]
  transactions: Transaction[]
}

export function BudgetProgressCard({ categories, transactions }: Props) {
  const spent: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type === 'expense') spent[t.category] = (spent[t.category] ?? 0) + t.amount
  }

  if (categories.length === 0) return null

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const s = spent[cat.category] ?? 0
        const pct = Math.min(100, (s / cat.limit_amount) * 100)
        const over = s > cat.limit_amount
        const warn = pct >= 80 && !over
        return (
          <div key={cat.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{cat.category}</span>
              <span className={cn(over ? 'text-red-600' : warn ? 'text-amber-600' : 'text-muted-foreground')}>
                £{s.toFixed(2)} / £{cat.limit_amount.toFixed(2)}
              </span>
            </div>
            <Progress
              value={pct}
              className={cn('h-2', over ? '[&>div]:bg-red-500' : warn ? '[&>div]:bg-amber-500' : '')}
            />
          </div>
        )
      })}
    </div>
  )
}
