'use client'

import { useState } from 'react'
import { addTransaction } from '@/actions/finance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EXPENSE_CATEGORIES } from '@/lib/constants'

export function TransactionForm() {
  const [pending, setPending] = useState(false)
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    fd.set('type', type)
    fd.set('category', category)
    await addTransaction(fd)
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`flex-1 py-1.5 rounded-md text-sm border transition-colors ${type === 'expense' ? 'bg-red-100 border-red-300 text-red-700' : 'border-input hover:bg-accent'}`}
        >Expense</button>
        <button
          type="button"
          onClick={() => setType('income')}
          className={`flex-1 py-1.5 rounded-md text-sm border transition-colors ${type === 'income' ? 'bg-green-100 border-green-300 text-green-700' : 'border-input hover:bg-accent'}`}
        >Income</button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="txn-amount">Amount (£)</Label>
          <Input id="txn-amount" name="amount" type="number" step="0.01" min="0.01" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="txn-date">Date</Label>
          <Input id="txn-date" name="txn_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => { if (v) setCategory(v as typeof category) }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label htmlFor="txn-desc">Description</Label>
        <Input id="txn-desc" name="description" placeholder="Optional" />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Adding…' : 'Add Transaction'}
      </Button>
    </form>
  )
}
