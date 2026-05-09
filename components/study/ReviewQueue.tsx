'use client'

import { useState } from 'react'
import { markSectionReviewed } from '@/actions/study'
import type { StudySection, StudyModule } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface ReviewItem extends StudySection {
  module_name: string
}

export function ReviewQueue({ items }: { items: ReviewItem[] }) {
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState('3')

  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">No sections due for review. Keep it up.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary">{items.length} due</Badge>
        <span className="text-sm text-muted-foreground">Review these sections to reinforce your knowledge</span>
      </div>
      {items.map((item) => (
        <div key={item.id}>
          <Card className="border-amber-200">
            <CardContent className="pt-3 pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{item.module_name}</p>
                  <p className="text-sm font-medium">{item.section_number}. {item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Difficulty: ★{item.difficulty ?? '?'} · Due: {item.next_review_on}
                  </p>
                </div>
                <Button
                  size="sm" variant="outline"
                  className="shrink-0 h-7 text-xs"
                  onClick={() => setReviewing(reviewing === item.id ? null : item.id)}
                >
                  Review
                </Button>
              </div>

              {reviewing === item.id && (
                <div className="mt-2 flex items-center gap-2">
                  <Select value={difficulty} onValueChange={(v) => { if (v) setDifficulty(v) }}>
                    <SelectTrigger className="h-7 text-xs w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n} — {['Very easy','Easy','Medium','Hard','Very hard'][n-1]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-7 text-xs" onClick={async () => {
                    await markSectionReviewed(item.id, Number(difficulty))
                    setReviewing(null)
                  }}>
                    Done
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
