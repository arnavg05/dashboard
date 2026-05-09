import { createClient } from '@/lib/supabase/server'
import { HabitGrid } from '@/components/habits/HabitGrid'
import { HabitForm } from '@/components/habits/HabitForm'
import { GoalForm } from '@/components/habits/GoalForm'
import { GoalProgressCard } from '@/components/habits/GoalProgressCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

export default async function HabitsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: habits }, { data: completions }, { data: goals }] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user!.id).eq('archived', false).order('created_at'),
    supabase.from('habit_completions').select('*').eq('user_id', user!.id).eq('completed_on', today),
    supabase.from('goals').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
  ])

  const doneCount = completions?.length ?? 0
  const totalHabits = habits?.length ?? 0
  const activeGoals = goals?.filter((g) => !g.completed) ?? []
  const completedGoals = goals?.filter((g) => g.completed) ?? []

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Habits & Goals</h1>
        <Badge variant={doneCount === totalHabits && totalHabits > 0 ? 'default' : 'secondary'}>
          {doneCount}/{totalHabits} today
        </Badge>
      </div>

      <Tabs defaultValue="habits">
        <TabsList>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="habits" className="space-y-4 mt-4">
          <HabitGrid
            habits={habits ?? []}
            completions={completions ?? []}
            today={today}
          />
          <HabitForm />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4 mt-4">
          {activeGoals.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Active</p>
              {activeGoals.map((g) => <GoalProgressCard key={g.id} goal={g} />)}
            </div>
          )}
          {completedGoals.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              {completedGoals.map((g) => <GoalProgressCard key={g.id} goal={g} />)}
            </div>
          )}
          {(goals?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No goals yet.</p>
          )}
          <GoalForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
