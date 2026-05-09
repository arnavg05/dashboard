import { createClient } from '@/lib/supabase/server'
import { checkAccountability } from '@/lib/accountability'
import { AccountabilityBanner } from '@/components/dashboard/AccountabilityBanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Activity, DollarSign, CheckSquare, BookOpen } from 'lucide-react'
import { isDueForReview } from '@/lib/spaced-repetition'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const monthStart = todayStr.slice(0, 7) + '-01'

  const [
    alerts,
    { data: habits },
    { data: todayCompletions },
    { data: prefs },
    { data: stepsRow },
    { data: hydLogs },
    { data: lastSleep },
    { data: lastWorkout },
    { data: budgetPlan },
    { data: monthTxns },
    { data: studyModules },
    { data: reviewsDue },
  ] = await Promise.all([
    checkAccountability(supabase, user.id),
    supabase.from('habits').select('id').eq('user_id', user.id).eq('archived', false).eq('frequency', 'daily'),
    supabase.from('habit_completions').select('id').eq('user_id', user.id).eq('completed_on', todayStr),
    supabase.from('user_preferences').select('daily_steps_goal,daily_water_goal_ml').eq('user_id', user.id).single(),
    supabase.from('daily_steps').select('steps').eq('user_id', user.id).eq('step_date', todayStr).single(),
    supabase.from('hydration_logs').select('amount_ml').eq('user_id', user.id).gte('logged_at', `${todayStr}T00:00:00.000Z`),
    supabase.from('sleep_logs').select('duration_min,sleep_date').eq('user_id', user.id).order('sleep_date', { ascending: false }).limit(1).single(),
    supabase.from('workout_logs').select('type,logged_at').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(1).single(),
    supabase.from('budget_plans').select('total_income,savings_amount').eq('user_id', user.id).eq('month', monthStart).eq('status', 'active').single(),
    supabase.from('transactions').select('type,amount').eq('user_id', user.id).gte('txn_date', monthStart),
    supabase.from('study_modules').select('id,name,total_sections').eq('user_id', user.id).eq('archived', false).limit(3),
    supabase.from('study_sections').select('id,next_review_on').eq('user_id', user.id).eq('completed', true),
  ])

  const stepsGoal = prefs?.daily_steps_goal ?? 10000
  const todaySteps = stepsRow?.steps ?? 0
  const stepsPct = Math.min(100, (todaySteps / stepsGoal) * 100)
  const goalMl = prefs?.daily_water_goal_ml ?? 2000
  const todayMl = hydLogs?.reduce((s, l) => s + l.amount_ml, 0) ?? 0
  const hydPct = Math.min(100, (todayMl / goalMl) * 100)
  const sleepH = lastSleep ? (lastSleep.duration_min / 60).toFixed(1) : null

  const habitDone = todayCompletions?.length ?? 0
  const habitTotal = habits?.length ?? 0

  const monthExpense = monthTxns?.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) ?? 0
  const budget = budgetPlan?.total_income ? budgetPlan.total_income - budgetPlan.savings_amount : null
  const financePct = budget ? Math.min(100, (monthExpense / budget) * 100) : null

  const reviewCount = reviewsDue?.filter((s) => isDueForReview(s.next_review_on)).length ?? 0

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <AccountabilityBanner alerts={alerts} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link href="/health">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" /> Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Steps</span>
                  <span>{todaySteps.toLocaleString()} / {stepsGoal.toLocaleString()}</span>
                </div>
                <Progress value={stepsPct} className="h-1.5" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Hydration</span>
                  <span>{(todayMl / 1000).toFixed(1)}L / {(goalMl / 1000).toFixed(1)}L</span>
                </div>
                <Progress value={hydPct} className="h-1.5" />
              </div>
              {sleepH && <p className="text-xs text-muted-foreground">Last sleep: {sleepH}h</p>}
              {lastWorkout && (
                <p className="text-xs text-muted-foreground">
                  Last workout: {lastWorkout.type} · {lastWorkout.logged_at}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/finance">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Finance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {budget ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Spending</span>
                      <span>£{monthExpense.toFixed(0)} / £{budget.toFixed(0)}</span>
                    </div>
                    <Progress
                      value={financePct ?? 0}
                      className={`h-1.5 ${financePct && financePct > 90 ? '[&>div]:bg-red-500' : ''}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Saved: £{(budgetPlan?.savings_amount ?? 0).toFixed(0)} this month
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Set up your budget to see stats.</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/habits">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Habits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {habitTotal > 0 ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Today</span><span>{habitDone}/{habitTotal}</span>
                    </div>
                    <Progress value={habitTotal ? (habitDone / habitTotal) * 100 : 0} className="h-1.5" />
                  </div>
                  {habitDone === habitTotal && <Badge className="text-xs">All done!</Badge>}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No habits set up yet.</p>
              )}
            </CardContent>
          </Card>
        </Link>

        <Link href="/study">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Study
                {reviewCount > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 ml-auto">{reviewCount}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {(studyModules?.length ?? 0) > 0 ? (
                studyModules!.map((m) => (
                  <p key={m.id} className="text-xs text-muted-foreground truncate">{m.name}</p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No study modules yet.</p>
              )}
              {reviewCount > 0 && (
                <p className="text-xs text-amber-600 font-medium">{reviewCount} to review</p>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
