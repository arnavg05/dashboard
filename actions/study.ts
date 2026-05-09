'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'
import { getNextReviewDate } from '@/lib/spaced-repetition'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function createStudyModule(formData: FormData) {
  const { supabase, user } = await getUser()
  const name = formData.get('name') as string
  const totalSections = Number(formData.get('total_sections'))

  const { data: mod } = await supabase.from('study_modules').insert({
    user_id: user.id,
    name,
    total_sections: totalSections,
  }).select().single()

  if (mod) {
    const sections = Array.from({ length: totalSections }, (_, i) => ({
      user_id: user.id,
      module_id: mod.id,
      title: `Section ${i + 1}`,
      section_number: i + 1,
    }))
    await supabase.from('study_sections').insert(sections)
  }

  refresh()
}

export async function updateSectionTitle(id: string, title: string) {
  const { supabase } = await getUser()
  await supabase.from('study_sections').update({ title }).eq('id', id)
  refresh()
}

export async function logStudySession(formData: FormData) {
  const { supabase, user } = await getUser()
  const sectionId = formData.get('section_id') as string
  const difficulty = formData.get('difficulty') ? Number(formData.get('difficulty')) : null
  const completedOn = (formData.get('completed_on') as string) || new Date().toISOString().split('T')[0]

  // Mark section as completed and set review date
  if (sectionId && difficulty) {
    const nextReview = getNextReviewDate(difficulty, new Date(completedOn))
    await supabase.from('study_sections').update({
      completed: true,
      completed_on: completedOn,
      difficulty,
      next_review_on: nextReview,
    }).eq('id', sectionId)
  }

  // Log the session
  await supabase.from('study_sessions').insert({
    user_id: user.id,
    module_id: formData.get('module_id') as string,
    section_id: sectionId || null,
    started_at: new Date().toISOString(),
    duration_min: Number(formData.get('duration_min')),
    notes: (formData.get('notes') as string) || null,
  })

  refresh()
}

export async function markSectionReviewed(sectionId: string, difficulty: number) {
  const { supabase } = await getUser()
  const nextReview = getNextReviewDate(difficulty)
  await supabase.from('study_sections').update({
    difficulty,
    next_review_on: nextReview,
  }).eq('id', sectionId)
  refresh()
}

export async function archiveStudyModule(id: string) {
  const { supabase } = await getUser()
  await supabase.from('study_modules').update({ archived: true }).eq('id', id)
  refresh()
}
