import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { WorkoutLogForm } from '@/components/health/WorkoutLogForm'
import { SleepLogForm } from '@/components/health/SleepLogForm'
import { WeightLogForm } from '@/components/health/WeightLogForm'
import { HydrationTracker } from '@/components/health/HydrationTracker'
import { SupplementGrid } from '@/components/health/SupplementGrid'
import { SupplementForm } from '@/components/health/SupplementForm'
import { GymSchedulePrompt } from '@/components/health/GymSchedulePrompt'
import { GymReminderCard } from '@/components/health/GymReminderCard'
import { StepsTracker } from '@/components/health/StepsTracker'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function HealthPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Day of week: 0=Sun, ISO: Mon=1 Sat=6 Sun=7
  const dow = today.getDay()
  const isoDow = dow === 0 ? 7 : dow
  const isSunday = dow === 0

  // Monday of current week
  const mondayOffset = dow === 0 ? -6 : 1 - dow
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() + mondayOffset)
  const weekStartStr = weekStart.toISOString().split('T')[0]

  const [
    { data: prefs },
    { data: supplements },
    { data: suppLogs },
    { data: hydLogs },
    { data: stepsRow },
    { data: gymSchedule },
    { data: gymCheckin },
    { data: recentWorkouts },
  ] = await Promise.all([
    supabase.from('user_preferences').select('*').eq('user_id', user!.id).single(),
    supabase.from('supplements').select('*').eq('user_id', user!.id).eq('archived', false).order('created_at'),
    supabase.from('supplement_logs').select('*').eq('user_id', user!.id).eq('taken_on', todayStr),
    supabase.from('hydration_logs').select('amount_ml').eq('user_id', user!.id)
      .gte('logged_at', `${todayStr}T00:00:00.000Z`),
    supabase.from('daily_steps').select('steps').eq('user_id', user!.id).eq('step_date', todayStr).single(),
    supabase.from('gym_schedules').select('planned_days').eq('user_id', user!.id).eq('week_start', weekStartStr).single(),
    supabase.from('gym_checkins').select('went').eq('user_id', user!.id).eq('checkin_date', todayStr).single(),
    supabase.from('workout_logs').select('*').eq('user_id', user!.id).order('logged_at', { ascending: false }).limit(10),
  ])

  const todayMl = hydLogs?.reduce((s, l) => s + l.amount_ml, 0) ?? 0
  const goalMl = prefs?.daily_water_goal_ml ?? 2000
  const stepsGoal = prefs?.daily_steps_goal ?? 10000
  const todaySteps = stepsRow?.steps ?? 0
  const weightUnit = prefs?.weight_unit ?? 'kg'

  const isGymDay = gymSchedule?.planned_days.includes(isoDow) ?? false
  const noCheckin = !gymCheckin

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health</h1>
        <Link href="/health/progress">
          <Button variant="outline" size="sm">Progress</Button>
        </Link>
      </div>

      {/* Gym schedule prompt on Sundays */}
      {isSunday && !gymSchedule && (
        <GymSchedulePrompt weekStart={weekStartStr} />
      )}

      {/* Gym reminder on gym days */}
      {isGymDay && noCheckin && (
        <GymReminderCard today={todayStr} />
      )}

      <Tabs defaultValue="today">
        <TabsList className="w-full">
          <TabsTrigger value="today" className="flex-1">Today</TabsTrigger>
          <TabsTrigger value="log" className="flex-1">Log</TabsTrigger>
          <TabsTrigger value="supplements" className="flex-1">Supplements</TabsTrigger>
        </TabsList>

        {/* TODAY TAB */}
        <TabsContent value="today" className="mt-4 grid grid-cols-2 gap-4">
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader><CardTitle className="text-sm">Steps</CardTitle></CardHeader>
            <CardContent>
              <StepsTracker todaySteps={todaySteps} goal={stepsGoal} />
            </CardContent>
          </Card>
          <Card className="col-span-2 sm:col-span-1">
            <CardHeader><CardTitle className="text-sm">Hydration</CardTitle></CardHeader>
            <CardContent>
              <HydrationTracker todayMl={todayMl} goalMl={goalMl} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOG TAB */}
        <TabsContent value="log" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Log Workout</CardTitle></CardHeader>
            <CardContent><WorkoutLogForm /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Log Sleep</CardTitle></CardHeader>
            <CardContent><SleepLogForm /></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Log Weight</CardTitle></CardHeader>
            <CardContent><WeightLogForm unit={weightUnit} /></CardContent>
          </Card>

          {/* Recent workouts */}
          {recentWorkouts && recentWorkouts.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent Workouts</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentWorkouts.slice(0, 5).map((w) => (
                    <div key={w.id} className="flex items-center justify-between text-sm">
                      <span>{w.type}</span>
                      <span className="text-muted-foreground">{w.duration_min}min · {w.logged_at}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SUPPLEMENTS TAB */}
        <TabsContent value="supplements" className="mt-4 space-y-4">
          <SupplementGrid supplements={supplements ?? []} logs={suppLogs ?? []} today={todayStr} />
          <SupplementForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
