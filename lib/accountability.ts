import type { SupabaseClient } from '@supabase/supabase-js'

export type AlertSeverity = 'warn' | 'scold'

export interface AccountabilityAlert {
  area: string
  message: string
  severity: AlertSeverity
}

export async function checkAccountability(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string
): Promise<AccountabilityAlert[]> {
  const alerts: AccountabilityAlert[] = []
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const todayDow = today.getDay() // 0=Sun, 1=Mon...
  const hour = today.getHours()

  // --- GYM ---
  const mondayOffset = todayDow === 0 ? -6 : 1 - todayDow
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + mondayOffset)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const { data: gymSchedule } = await supabase.from('gym_schedules')
    .select('planned_days').eq('user_id', userId).eq('week_start', weekStartStr).single()

  if (gymSchedule) {
    // today's ISO dow: Mon=1, Sun=7 — convert from JS Sun=0
    const isoDow = todayDow === 0 ? 7 : todayDow
    const isGymDay = gymSchedule.planned_days.includes(isoDow)

    if (isGymDay) {
      const { data: checkin } = await supabase.from('gym_checkins')
        .select('went').eq('user_id', userId).eq('checkin_date', todayStr).single()
      if (!checkin && hour >= 21) {
        alerts.push({
          area: 'Gym',
          message: 'You had the gym planned today and never went. Stop making excuses.',
          severity: 'scold',
        })
      }
    }

    // Check last 3 days for consecutive misses
    let missedInARow = 0
    for (let i = 1; i <= 3; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const ds = d.toISOString().split('T')[0]
      const dow = d.getDay() === 0 ? 7 : d.getDay()
      if (gymSchedule.planned_days.includes(dow)) {
        const { data: c } = await supabase.from('gym_checkins')
          .select('went').eq('user_id', userId).eq('checkin_date', ds).single()
        if (!c || !c.went) missedInARow++
        else break
      }
    }
    if (missedInARow >= 2) {
      alerts.push({
        area: 'Gym',
        message: `You've skipped the gym ${missedInARow} days in a row. That's not acceptable.`,
        severity: 'scold',
      })
    }
  }

  // --- HABITS ---
  const { data: habits } = await supabase.from('habits')
    .select('id, name').eq('user_id', userId).eq('archived', false).eq('frequency', 'daily')

  if (habits && habits.length > 0) {
    const { data: completions } = await supabase.from('habit_completions')
      .select('habit_id').eq('user_id', userId).eq('completed_on', todayStr)

    const completedIds = new Set(completions?.map((c) => c.habit_id) ?? [])
    const doneCount = completedIds.size
    const ratio = doneCount / habits.length

    if (ratio < 0.5 && hour >= 20) {
      alerts.push({
        area: 'Habits',
        message: `You've done ${doneCount} out of ${habits.length} habits today. Sort it out.`,
        severity: 'scold',
      })
    }

    // Check if any habit's streak was broken yesterday
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const { data: yCompletions } = await supabase.from('habit_completions')
      .select('habit_id').eq('user_id', userId).eq('completed_on', yesterdayStr)
    const yDoneIds = new Set(yCompletions?.map((c) => c.habit_id) ?? [])

    for (const habit of habits) {
      if (!yDoneIds.has(habit.id)) {
        // Check if they had a streak before (completed 2 days ago)
        const twoDaysAgo = new Date(today)
        twoDaysAgo.setDate(today.getDate() - 2)
        const { data: streakCheck } = await supabase.from('habit_completions')
          .select('id').eq('habit_id', habit.id)
          .eq('completed_on', twoDaysAgo.toISOString().split('T')[0]).single()
        if (streakCheck) {
          alerts.push({
            area: 'Habits',
            message: `Your streak for "${habit.name}" just broke because you skipped yesterday.`,
            severity: 'warn',
          })
          break // one streak-break warning is enough
        }
      }
    }
  }

  // --- HYDRATION ---
  if (hour >= 18) {
    const { data: prefs } = await supabase.from('user_preferences')
      .select('daily_water_goal_ml').eq('user_id', userId).single()
    const goal = prefs?.daily_water_goal_ml ?? 2000

    const startOfDay = `${todayStr}T00:00:00.000Z`
    const { data: hydLogs } = await supabase.from('hydration_logs')
      .select('amount_ml').eq('user_id', userId).gte('logged_at', startOfDay)

    const total = hydLogs?.reduce((sum, l) => sum + l.amount_ml, 0) ?? 0
    if (total < goal * 0.5) {
      alerts.push({
        area: 'Hydration',
        message: `You've only had ${Math.round(total / 100) / 10}L today. Drink some water.`,
        severity: 'scold',
      })
    }
  }

  // --- SUPPLEMENTS ---
  if (hour >= 12) {
    const { data: supplements } = await supabase.from('supplements')
      .select('id, name').eq('user_id', userId).eq('archived', false)

    if (supplements && supplements.length > 0) {
      const { data: taken } = await supabase.from('supplement_logs')
        .select('supplement_id').eq('user_id', userId).eq('taken_on', todayStr)
      const takenIds = new Set(taken?.map((t) => t.supplement_id) ?? [])
      const untaken = supplements.filter((s) => !takenIds.has(s.id))
      if (untaken.length > 0) {
        alerts.push({
          area: 'Supplements',
          message: `You haven't taken your supplements yet. Do it now.`,
          severity: 'warn',
        })
      }
    }
  }

  // --- STEPS ---
  if (hour >= 20) {
    const { data: prefs } = await supabase.from('user_preferences')
      .select('daily_steps_goal').eq('user_id', userId).single()
    const stepsGoal = prefs?.daily_steps_goal ?? 10000

    const { data: stepsRow } = await supabase.from('daily_steps')
      .select('steps').eq('user_id', userId).eq('step_date', todayStr).single()
    const steps = stepsRow?.steps ?? 0
    if (steps < stepsGoal * 0.3) {
      alerts.push({
        area: 'Steps',
        message: `You've only done ${steps.toLocaleString()} steps today. You need to move.`,
        severity: 'scold',
      })
    }
  }

  // --- FINANCE ---
  const monthStart = todayStr.slice(0, 7) + '-01'
  const { data: budgetPlan } = await supabase.from('budget_plans')
    .select('id, savings_pct').eq('user_id', userId).eq('month', monthStart).eq('status', 'active').single()

  if (budgetPlan) {
    const { data: categories } = await supabase.from('budget_categories')
      .select('category, limit_amount').eq('plan_id', budgetPlan.id)

    if (categories && categories.length > 0) {
      const { data: txns } = await supabase.from('transactions')
        .select('category, amount').eq('user_id', userId)
        .eq('type', 'expense').gte('txn_date', monthStart)

      const spent: Record<string, number> = {}
      for (const t of txns ?? []) {
        spent[t.category] = (spent[t.category] ?? 0) + t.amount
      }

      for (const cat of categories) {
        const s = spent[cat.category] ?? 0
        const pct = s / cat.limit_amount
        if (pct >= 1) {
          alerts.push({
            area: 'Finance',
            message: `You've gone over your ${cat.category} budget. Stop spending.`,
            severity: 'scold',
          })
        } else if (pct >= 0.9) {
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
          const daysLeft = daysInMonth - today.getDate()
          alerts.push({
            area: 'Finance',
            message: `You've nearly blown your ${cat.category} budget with ${daysLeft} days left.`,
            severity: 'warn',
          })
        }
      }
    }
  }

  // --- STUDY ---
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  const { data: recentSession } = await supabase.from('study_sessions')
    .select('id').eq('user_id', userId)
    .gte('started_at', threeDaysAgo.toISOString()).limit(1).single()

  if (!recentSession) {
    const { data: anyModule } = await supabase.from('study_modules')
      .select('id').eq('user_id', userId).eq('archived', false).limit(1).single()
    if (anyModule) {
      alerts.push({
        area: 'Study',
        message: "You haven't studied in 3 days. Open a book.",
        severity: 'scold',
      })
    }
  }

  // Check overdue reviews
  const { data: overdue } = await supabase.from('study_sections')
    .select('id').eq('user_id', userId).eq('completed', true)
    .not('next_review_on', 'is', null).lte('next_review_on', todayStr)

  if (overdue && overdue.length > 0) {
    alerts.push({
      area: 'Study',
      message: `You have ${overdue.length} section${overdue.length > 1 ? 's' : ''} overdue for review. Don't let knowledge slip.`,
      severity: 'warn',
    })
  }

  // --- SLEEP ---
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const { data: lastSleep } = await supabase.from('sleep_logs')
    .select('duration_min').eq('user_id', userId)
    .eq('sleep_date', yesterday.toISOString().split('T')[0]).single()

  if (lastSleep && lastSleep.duration_min < 360) {
    const hours = Math.floor(lastSleep.duration_min / 60)
    const mins = lastSleep.duration_min % 60
    alerts.push({
      area: 'Sleep',
      message: `You got ${hours}h ${mins}m of sleep last night. You need to fix this.`,
      severity: 'scold',
    })
  }

  return alerts
}
