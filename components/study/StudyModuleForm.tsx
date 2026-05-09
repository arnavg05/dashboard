'use client'

import { useState } from 'react'
import { createStudyModule } from '@/actions/study'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function StudyModuleForm() {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    await createStudyModule(new FormData(e.currentTarget))
    ;(e.target as HTMLFormElement).reset()
    setPending(false)
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">Add Study Module</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="mod-name">Module name</Label>
            <Input id="mod-name" name="name" placeholder="e.g. AWS Solutions Architect" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mod-sections">Number of sections</Label>
            <Input id="mod-sections" name="total_sections" type="number" min="1" max="200" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating…' : 'Create Module'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
