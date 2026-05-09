'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function createHabit(formData: FormData) {
  const { supabase, user } = await getUser()
  await supabase.from('habits').insert({
    user_id: user.id,
    name: formData.get('name') as string,
    frequency: (formData.get('frequency') as string) ?? 'daily',
    color: (formData.get('color') as string) || null,
  })
  refresh()
}

export async function archiveHabit(id: string) {
  const { supabase } = await getUser()
  await supabase.from('habits').update({ archived: true }).eq('id', id)
  refresh()
}

export async function toggleHabitCompletion(habitId: string, date: string, completed: boolean) {
  const { supabase, user } = await getUser()
  if (completed) {
    await supabase.from('habit_completions').delete()
      .eq('habit_id', habitId).eq('completed_on', date)
  } else {
    await supabase.from('habit_completions').insert({
      user_id: user.id,
      habit_id: habitId,
      completed_on: date,
    })
  }
  refresh()
}

export async function createGoal(formData: FormData) {
  const { supabase, user } = await getUser()
  await supabase.from('goals').insert({
    user_id: user.id,
    title: formData.get('title') as string,
    description: (formData.get('description') as string) || null,
    target_value: formData.get('target_value') ? Number(formData.get('target_value')) : null,
    current_value: 0,
    unit: (formData.get('unit') as string) || null,
    due_date: (formData.get('due_date') as string) || null,
  })
  refresh()
}

export async function updateGoalProgress(id: string, currentValue: number) {
  const { supabase } = await getUser()
  await supabase.from('goals').update({ current_value: currentValue }).eq('id', id)
  refresh()
}

export async function completeGoal(id: string) {
  const { supabase } = await getUser()
  await supabase.from('goals').update({ completed: true }).eq('id', id)
  refresh()
}
