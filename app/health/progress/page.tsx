import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HealthProgressCharts } from '@/components/health/HealthProgressCharts'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default async function HealthProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

  const [
    { data: weightLogs },
    { data: sleepLogs },
    { data: workoutLogs },
    { data: hydLogs },
    { data: steps },
    { data: supplements },
    { data: suppLogs },
    { data: prefs },
  ] = await Promise.all([
    supabase.from('weight_logs').select('logged_at,weight_kg').eq('user_id', user!.id)
      .gte('logged_at', thirtyDaysAgoStr).order('logged_at'),
    supabase.from('sleep_logs').select('sleep_date,duration_min,quality').eq('user_id', user!.id)
      .gte('sleep_date', thirtyDaysAgoStr).order('sleep_date'),
    supabase.from('workout_logs').select('logged_at,type,duration_min').eq('user_id', user!.id)
      .gte('logged_at', thirtyDaysAgoStr).order('logged_at'),
    supabase.from('hydration_logs').select('logged_at,amount_ml').eq('user_id', user!.id)
      .gte('logged_at', `${thirtyDaysAgoStr}T00:00:00.000Z`),
    supabase.from('daily_steps').select('step_date,steps').eq('user_id', user!.id)
      .gte('step_date', thirtyDaysAgoStr).order('step_date'),
    supabase.from('supplements').select('id').eq('user_id', user!.id).eq('archived', false),
    supabase.from('supplement_logs').select('supplement_id,taken_on').eq('user_id', user!.id)
      .gte('taken_on', thirtyDaysAgoStr),
    supabase.from('user_preferences').select('*').eq('user_id', user!.id).single(),
  ])

  // Summary stats
  const avgSleepMin = sleepLogs?.length
    ? Math.round(sleepLogs.reduce((s, l) => s + l.duration_min, 0) / sleepLogs.length)
    : null
  const workoutsThisMonth = workoutLogs?.length ?? 0
  const stepsGoal = prefs?.daily_steps_goal ?? 10000
  const stepsGoalDays = steps?.filter((s) => s.steps >= stepsGoal).length ?? 0
  const totalDays = steps?.length ?? 0

  const totalSupplements = (supplements?.length ?? 0) * 30
  const totalTaken = suppLogs?.length ?? 0
  const suppPct = totalSupplements > 0 ? Math.round((totalTaken / totalSupplements) * 100) : null

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/health">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Health Progress</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Avg sleep</p>
            <p className="text-lg font-bold">
              {avgSleepMin ? `${Math.floor(avgSleepMin / 60)}h ${avgSleepMin % 60}m` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Workouts (30d)</p>
            <p className="text-lg font-bold">{workoutsThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Steps goal hit</p>
            <p className="text-lg font-bold">
              {totalDays ? `${stepsGoalDays}/${totalDays}d` : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Supplement adherence</p>
            <p className="text-lg font-bold">{suppPct !== null ? `${suppPct}%` : '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <HealthProgressCharts
        weightLogs={weightLogs ?? []}
        sleepLogs={sleepLogs ?? []}
        steps={steps ?? []}
        hydLogs={hydLogs ?? []}
        stepsGoal={stepsGoal}
      />
    </div>
  )
}
