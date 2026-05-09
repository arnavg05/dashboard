'use server'

import { createClient } from '@/lib/supabase/server'
import { refresh } from 'next/cache'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  return { supabase, user }
}

export async function saveIncomeSource(formData: FormData) {
  const { supabase, user } = await getUser()
  const id = formData.get('id') as string
  const data = {
    user_id: user.id,
    name: formData.get('name') as string,
    pay_day_of_month: Number(formData.get('pay_day_of_month')),
    default_amount: Number(formData.get('default_amount')),
    currency: (formData.get('currency') as string) || 'GBP',
  }
  if (id) {
    await supabase.from('income_sources').update(data).eq('id', id)
  } else {
    await supabase.from('income_sources').insert(data)
  }
  refresh()
}

export async function logIncome(formData: FormData) {
  const { supabase, user } = await getUser()
  const sourceId = formData.get('source_id') as string
  const amount = Number(formData.get('amount'))
  const receivedOn = (formData.get('received_on') as string) || new Date().toISOString().split('T')[0]
  await supabase.from('income_logs').insert({
    user_id: user.id,
    source_id: sourceId,
    received_on: receivedOn,
    amount,
    notes: (formData.get('notes') as string) || null,
  })
  // Also create a transaction entry for the income
  const monthStart = receivedOn.slice(0, 7) + '-01'
  const { data: plan } = await supabase.from('budget_plans')
    .select('id').eq('user_id', user.id).eq('month', monthStart).single()
  await supabase.from('transactions').insert({
    user_id: user.id,
    txn_date: receivedOn,
    type: 'income',
    amount,
    category: 'Income',
    source: 'manual',
    plan_id: plan?.id || null,
  })
  refresh()
}

export async function saveBudgetPlan(formData: FormData) {
  const { supabase, user } = await getUser()
  const month = formData.get('month') as string
  const totalIncome = Number(formData.get('total_income'))
  const savingsPct = Number(formData.get('savings_pct'))
  const savingsAmount = (totalIncome * savingsPct) / 100
  const { data: plan } = await supabase.from('budget_plans').upsert({
    user_id: user.id,
    month,
    total_income: totalIncome,
    savings_pct: savingsPct,
    savings_amount: savingsAmount,
    status: 'active',
  }).select().single()
  refresh()
  return plan?.id
}

export async function saveBudgetCategory(planId: string, category: string, limitAmount: number) {
  const { supabase } = await getUser()
  // Upsert by plan_id + category
  const { data: existing } = await supabase.from('budget_categories')
    .select('id').eq('plan_id', planId).eq('category', category).single()
  if (existing) {
    await supabase.from('budget_categories').update({ limit_amount: limitAmount }).eq('id', existing.id)
  } else {
    await supabase.from('budget_categories').insert({ plan_id: planId, category, limit_amount: limitAmount })
  }
  refresh()
}

export async function addTransaction(formData: FormData) {
  const { supabase, user } = await getUser()
  const txnDate = (formData.get('txn_date') as string) || new Date().toISOString().split('T')[0]
  const monthStart = txnDate.slice(0, 7) + '-01'
  const { data: plan } = await supabase.from('budget_plans')
    .select('id').eq('user_id', user.id).eq('month', monthStart).single()
  await supabase.from('transactions').insert({
    user_id: user.id,
    txn_date: txnDate,
    type: formData.get('type') as 'income' | 'expense',
    amount: Number(formData.get('amount')),
    category: formData.get('category') as string,
    description: (formData.get('description') as string) || null,
    source: 'manual',
    plan_id: plan?.id || null,
  })
  refresh()
}

export async function deleteTransaction(id: string) {
  const { supabase } = await getUser()
  await supabase.from('transactions').delete().eq('id', id)
  refresh()
}

export async function saveSavingsGoal(formData: FormData) {
  const { supabase, user } = await getUser()
  const id = formData.get('id') as string
  const data = {
    user_id: user.id,
    name: formData.get('name') as string,
    target_amount: Number(formData.get('target_amount')),
    current_amount: Number(formData.get('current_amount')) || 0,
    target_date: (formData.get('target_date') as string) || null,
  }
  if (id) {
    await supabase.from('savings_goals').update(data).eq('id', id)
  } else {
    await supabase.from('savings_goals').insert(data)
  }
  refresh()
}

export async function deleteSavingsGoal(id: string) {
  const { supabase } = await getUser()
  await supabase.from('savings_goals').delete().eq('id', id)
  refresh()
}
