import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface HealthSyncPayload {
  date: string
  steps?: number
  sleep_minutes?: number
  sleep_quality?: number | null
  weight_kg?: number | null
  workouts?: { type: string; duration_min: number; intensity?: number | null }[]
}

export async function POST(request: Request) {
  const auth = request.headers.get('Authorization')
  const secret = process.env.HEALTH_SYNC_SECRET
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No session' }, { status: 401 })

  const body: HealthSyncPayload = await request.json()
  const { date, steps, sleep_minutes, sleep_quality, weight_kg, workouts } = body

  const ops: (() => Promise<unknown>)[] = []

  if (steps != null) {
    ops.push(async () => { await supabase.from('daily_steps').upsert({ user_id: user.id, step_date: date, steps }) })
  }

  if (sleep_minutes != null) {
    ops.push(async () => {
      await supabase.from('sleep_logs').upsert({
        user_id: user.id,
        sleep_date: date,
        duration_min: sleep_minutes,
        quality: sleep_quality ?? null,
      })
    })
  }

  if (weight_kg != null) {
    ops.push(async () => {
      await supabase.from('weight_logs').insert({
        user_id: user.id,
        logged_at: date,
        weight_kg,
      })
    })
  }

  if (workouts?.length) {
    ops.push(async () => {
      await supabase.from('workout_logs').insert(
        workouts.map((w) => ({
          user_id: user.id,
          logged_at: date,
          type: w.type,
          duration_min: w.duration_min,
          intensity: w.intensity ?? null,
        }))
      )
    })
  }

  await Promise.allSettled(ops.map((fn) => fn()))
  return NextResponse.json({ ok: true })
}
