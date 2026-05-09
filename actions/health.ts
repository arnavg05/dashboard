'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function logWorkout(formData: FormData) {
  const { supabase, user } = await getUser()
  await supabase.from('workout_logs').insert({
    user_id: user.id,
    logged_at: (formData.get('logged_at') as string) || new Date().toISOString().split('T')[0],
    type: formData.get('type') as string,
    duration_min: Number(formData.get('duration_min')),
    intensity: formData.get('intensity') ? Number(formData.get('intensity')) : null,
    notes: (formData.get('notes') as string) || null,
  })
  refresh()
}

export async function logSleep(formData: FormData) {
  const { supabase, user } = await getUser()
  const bedtime = formData.get('bedtime') as string
  const wakeTime = formData.get('wake_time') as string
  let durationMin = formData.get('duration_min') ? Number(formData.get('duration_min')) : null
  if (!durationMin && bedtime && wakeTime) {
    const [bh, bm] = bedtime.split(':').map(Number)
    const [wh, wm] = wakeTime.split(':').map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    durationMin = mins
  }
  await supabase.from('sleep_logs').insert({
    user_id: user.id,
    sleep_date: (formData.get('sleep_date') as string) || new Date().toISOString().split('T')[0],
    duration_min: durationMin ?? 0,
    quality: formData.get('quality') ? Number(formData.get('quality')) : null,
    bedtime: bedtime || null,
    wake_time: wakeTime || null,
    notes: (formData.get('notes') as string) || null,
  })
  refresh()
}

export async function logWeight(formData: FormData) {
  const { supabase, user } = await getUser()
  await supabase.from('weight_logs').insert({
    user_id: user.id,
    logged_at: (formData.get('logged_at') as string) || new Date().toISOString().split('T')[0],
    weight_kg: Number(formData.get('weight_kg')),
    notes: (formData.get('notes') as string) || null,
  })
  refresh()
}

export async function logHydration(amountMl: number) {
  const { supabase, user } = await getUser()
  await supabase.from('hydration_logs').insert({
    user_id: user.id,
    amount_ml: amountMl,
  })
  refresh()
}

export async function updateWaterGoal(goalMl: number) {
  const { supabase, user } = await getUser()
  await supabase.from('user_preferences').upsert({
    user_id: user.id,
    daily_water_goal_ml: goalMl,
    updated_at: new Date().toISOString(),
  })
  refresh()
}

export async function updateStepsGoal(goal: number) {
  const { supabase, user } = await getUser()
  await supabase.from('user_preferences').upsert({
    user_id: user.id,
    daily_steps_goal: goal,
    updated_at: new Date().toISOString(),
  })
  refresh()
}

export async function saveSupplement(formData: FormData) {
  const { supabase, user } = await getUser()
  const id = formData.get('id') as string
  const data = {
    user_id: user.id,
    name: formData.get('name') as string,
    dose: (formData.get('dose') as string) || null,
  }
  if (id) {
    await supabase.from('supplements').update(data).eq('id', id)
  } else {
    await supabase.from('supplements').insert(data)
  }
  refresh()
}

export async function toggleSupplement(supplementId: string, date: string, taken: boolean) {
  const { supabase, user } = await getUser()
  if (taken) {
    await supabase.from('supplement_logs').delete()
      .eq('supplement_id', supplementId).eq('taken_on', date)
  } else {
    await supabase.from('supplement_logs').insert({
      user_id: user.id,
      supplement_id: supplementId,
      taken_on: date,
    })
  }
  refresh()
}

export async function saveGymSchedule(weekStart: string, plannedDays: number[]) {
  const { supabase, user } = await getUser()
  await supabase.from('gym_schedules').upsert({
    user_id: user.id,
    week_start: weekStart,
    planned_days: plannedDays,
  })
  refresh()
}

export async function logGymCheckin(date: string, went: boolean) {
  const { supabase, user } = await getUser()
  await supabase.from('gym_checkins').upsert({
    user_id: user.id,
    checkin_date: date,
    went,
  })
  if (went) {
    await supabase.from('workout_logs').insert({
      user_id: user.id,
      logged_at: date,
      type: 'Gym',
      duration_min: 60,
    })
  }
  refresh()
}
