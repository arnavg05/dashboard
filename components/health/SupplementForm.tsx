'use client'

import { useState } from 'react'
import { saveSupplement } from '@/actions/health'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SupplementForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await saveSupplement(new FormData(e.currentTarget))
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="space-y-1 flex-1">
        <Label htmlFor="supp-name">Supplement</Label>
        <Input id="supp-name" name="name" placeholder="Vitamin D" required />
      </div>
      <div className="space-y-1 w-28">
        <Label htmlFor="supp-dose">Dose</Label>
        <Input id="supp-dose" name="dose" placeholder="2000 IU" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? '…' : 'Add'}
      </Button>
    </form>
  )
}
