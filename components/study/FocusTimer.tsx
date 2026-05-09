'use client'

import { useState, useEffect, useRef } from 'react'
import { logStudySession } from '@/actions/study'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import type { StudyModule } from '@/types/database'
import { Play, Pause, RotateCcw } from 'lucide-react'

const WORK_MINS = 25
const BREAK_MINS = 5

export function FocusTimer({ modules }: { modules: StudyModule[] }) {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState<'work' | 'break'>('work')
  const [secsLeft, setSecsLeft] = useState(WORK_MINS * 60)
  const [moduleId, setModuleId] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!)
            setRunning(false)
            if (phase === 'work') {
              setElapsed((e) => e + WORK_MINS)
              setPhase('break')
              setSecsLeft(BREAK_MINS * 60)
            } else {
              setPhase('work')
              setSecsLeft(WORK_MINS * 60)
            }
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, phase])

  function reset() {
    setRunning(false)
    setPhase('work')
    setSecsLeft(WORK_MINS * 60)
    setElapsed(0)
  }

  async function finish() {
    if (!moduleId || elapsed < 1) return
    const fd = new FormData()
    fd.set('module_id', moduleId)
    fd.set('duration_min', String(elapsed))
    await logStudySession(fd)
    reset()
  }

  const mins = Math.floor(secsLeft / 60).toString().padStart(2, '0')
  const secs = (secsLeft % 60).toString().padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`text-5xl font-mono font-bold tabular-nums ${phase === 'break' ? 'text-green-600' : ''}`}>
        {mins}:{secs}
      </div>
      <p className="text-sm text-muted-foreground capitalize">{phase === 'work' ? 'Focus' : 'Break'}</p>

      <div className="flex gap-2">
        <Button
          variant={running ? 'outline' : 'default'}
          size="sm"
          onClick={() => setRunning(!running)}
        >
          {running ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Start</>}
        </Button>
        <Button variant="ghost" size="sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {elapsed > 0 && (
        <div className="flex flex-col items-center gap-2 w-full max-w-xs">
          <p className="text-xs text-muted-foreground">{elapsed} min studied</p>
          {modules.length > 0 && (
            <>
              <div className="w-full space-y-1">
                <Label className="text-xs">Link to module (optional)</Label>
                <Select value={moduleId} onValueChange={(v) => { if (v) setModuleId(v) }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full" onClick={finish} disabled={!moduleId}>
                Log session
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
