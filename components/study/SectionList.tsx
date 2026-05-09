'use client'

import { useState } from 'react'
import { logStudySession, updateSectionTitle } from '@/actions/study'
import type { StudySection } from '@/types/database'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, Circle, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isDueForReview } from '@/lib/spaced-repetition'

interface Props {
  moduleId: string
  sections: StudySection[]
}

export function SectionList({ moduleId, sections }: Props) {
  const [logging, setLogging] = useState<string | null>(null)
  const [difficulty, setDifficulty] = useState('3')
  const [duration, setDuration] = useState('30')
  const [editingTitle, setEditingTitle] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const completed = sections.filter((s) => s.completed).length
  const pct = sections.length ? (completed / sections.length) * 100 : 0

  async function submitLog(sectionId: string) {
    setPending(true)
    const fd = new FormData()
    fd.set('module_id', moduleId)
    fd.set('section_id', sectionId)
    fd.set('difficulty', difficulty)
    fd.set('duration_min', duration)
    fd.set('completed_on', new Date().toISOString().split('T')[0])
    await logStudySession(fd)
    setLogging(null)
    setDifficulty('3')
    setPending(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Progress value={pct} className="flex-1 h-2" />
        <span className="text-xs text-muted-foreground shrink-0">{completed}/{sections.length}</span>
      </div>

      {sections.map((section) => {
        const dueReview = isDueForReview(section.next_review_on)
        return (
          <div key={section.id}>
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                section.completed ? 'bg-muted/40' : 'hover:bg-accent cursor-pointer',
                dueReview && 'border-amber-300 bg-amber-50 dark:bg-amber-950'
              )}
              onClick={() => !section.completed && setLogging(section.id === logging ? null : section.id)}
            >
              {section.completed
                ? <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              }

              <div className="flex-1 min-w-0">
                {editingTitle === section.id ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    const val = (e.currentTarget.elements.namedItem('title') as HTMLInputElement).value
                    await updateSectionTitle(section.id, val)
                    setEditingTitle(null)
                  }} onClick={(e) => e.stopPropagation()}>
                    <Input name="title" defaultValue={section.title} autoFocus className="h-6 text-xs" />
                  </form>
                ) : (
                  <span
                    className={cn('text-sm', section.completed && 'line-through text-muted-foreground')}
                    onDoubleClick={(e) => { e.stopPropagation(); setEditingTitle(section.id) }}
                  >
                    {section.section_number}. {section.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {section.difficulty && (
                  <span className="text-xs text-muted-foreground">★{section.difficulty}</span>
                )}
                {dueReview && (
                  <span className="text-xs text-amber-600 font-medium">Review</span>
                )}
                {!section.completed && (
                  <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Log panel */}
            {logging === section.id && (
              <div className="mx-3 p-3 border border-t-0 rounded-b-lg bg-muted/30 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Difficulty (1–5)</Label>
                    <Select value={difficulty} onValueChange={(v) => { if (v) setDifficulty(v) }}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map((n) => <SelectItem key={n} value={String(n)}>{n} — {['Very easy','Easy','Medium','Hard','Very hard'][n-1]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Duration (min)</Label>
                    <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="h-7 text-xs" />
                  </div>
                </div>
                <Button size="sm" className="w-full h-7 text-xs" onClick={() => submitLog(section.id)} disabled={pending}>
                  {pending ? 'Saving…' : 'Mark as studied'}
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
