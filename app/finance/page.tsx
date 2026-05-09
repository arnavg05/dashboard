import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TransactionForm } from '@/components/finance/TransactionForm'
import { BudgetProgressCard } from '@/components/finance/BudgetProgressCard'
import { SavingsGoalCard, AddSavingsGoalForm } from '@/components/finance/SavingsGoalCard'
import { FinanceCharts } from '@/components/finance/FinanceCharts'
import { IncomeSection } from '@/components/finance/IncomeSection'
import { Badge } from '@/components/ui/badge'
import { deleteTransaction } from '@/actions/finance'
import { Trash2 } from 'lucide-react'

export default async function FinancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const today = new Date()
  const monthStart = today.toISOString().slice(0, 7) + '-01'
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(today.getMonth() - 6)

  const [
    { data: incomeSources },
    { data: budgetPlan },
    { data: savingsGoals },
    { data: txns },
    { data: allTxns },
  ] = await Promise.all([
    supabase.from('income_sources').select('*').eq('user_id', user!.id).eq('active', true).order('created_at'),
    supabase.from('budget_plans').select('*, budget_categories(*)').eq('user_id', user!.id)
      .eq('month', monthStart).eq('status', 'active').single(),
    supabase.from('savings_goals').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
    supabase.from('transactions').select('*').eq('user_id', user!.id)
      .gte('txn_date', monthStart).order('txn_date', { ascending: false }),
    supabase.from('transactions').select('*').eq('user_id', user!.id)
      .gte('txn_date', sixMonthsAgo.toISOString().split('T')[0]).order('txn_date', { ascending: false }),
  ])

  const monthIncome = txns?.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) ?? 0
  const monthExpense = txns?.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) ?? 0
  const budgetCategories = (budgetPlan as any)?.budget_categories ?? []

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Finance</h1>
        <div className="flex gap-2 text-sm">
          <Badge variant="outline" className="text-green-600">+£{monthIncome.toFixed(2)}</Badge>
          <Badge variant="outline" className="text-red-600">-£{monthExpense.toFixed(2)}</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="w-full">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="income" className="flex-1">Income</TabsTrigger>
          <TabsTrigger value="add" className="flex-1">Add</TabsTrigger>
          <TabsTrigger value="savings" className="flex-1">Savings</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          {budgetCategories.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Budget this month</CardTitle></CardHeader>
              <CardContent>
                <BudgetProgressCard categories={budgetCategories} transactions={txns ?? []} />
              </CardContent>
            </Card>
          )}

          <FinanceCharts transactions={allTxns ?? []} />

          {/* Transaction list */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Transactions this month</CardTitle></CardHeader>
            <CardContent>
              {(txns?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No transactions yet.</p>
              ) : (
                <div className="space-y-1">
                  {txns?.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                          {t.type === 'income' ? '+' : '-'}£{t.amount.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground truncate">{t.description || t.category}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs text-muted-foreground">{t.txn_date.slice(5)}</span>
                        <form action={deleteTransaction.bind(null, t.id)}>
                          <button type="submit" className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INCOME */}
        <TabsContent value="income" className="mt-4">
          <IncomeSection incomeSources={incomeSources ?? []} />
        </TabsContent>

        {/* ADD TRANSACTION */}
        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Transaction</CardTitle></CardHeader>
            <CardContent><TransactionForm /></CardContent>
          </Card>
        </TabsContent>

        {/* SAVINGS */}
        <TabsContent value="savings" className="mt-4 space-y-4">
          {savingsGoals?.map((g) => <SavingsGoalCard key={g.id} goal={g} />)}
          {(savingsGoals?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">No savings goals yet.</p>
          )}
          <Card>
            <CardHeader><CardTitle className="text-sm">Add Savings Goal</CardTitle></CardHeader>
            <CardContent><AddSavingsGoalForm /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
