export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      user_preferences: {
        Row: {
          user_id: string
          daily_water_goal_ml: number
          daily_steps_goal: number
          weight_unit: 'kg' | 'lbs'
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['user_preferences']['Row']> & { user_id: string }
        Update: Partial<Database['public']['Tables']['user_preferences']['Row']>
      }
      push_subscriptions: {
        Row: { id: string; user_id: string; endpoint: string; p256dh: string; auth: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Row']>
      }
      // Health
      weight_logs: {
        Row: { id: string; user_id: string; logged_at: string; weight_kg: number; notes: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['weight_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['weight_logs']['Row']>
      }
      sleep_logs: {
        Row: { id: string; user_id: string; sleep_date: string; duration_min: number; quality: number | null; bedtime: string | null; wake_time: string | null; notes: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['sleep_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['sleep_logs']['Row']>
      }
      workout_logs: {
        Row: { id: string; user_id: string; logged_at: string; type: string; duration_min: number; intensity: number | null; notes: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['workout_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['workout_logs']['Row']>
      }
      hydration_logs: {
        Row: { id: string; user_id: string; logged_at: string; amount_ml: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['hydration_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['hydration_logs']['Row']>
      }
      daily_steps: {
        Row: { id: string; user_id: string; step_date: string; steps: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['daily_steps']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['daily_steps']['Row']>
      }
      supplements: {
        Row: { id: string; user_id: string; name: string; dose: string | null; archived: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['supplements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['supplements']['Row']>
      }
      supplement_logs: {
        Row: { id: string; user_id: string; supplement_id: string; taken_on: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['supplement_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['supplement_logs']['Row']>
      }
      gym_schedules: {
        Row: { id: string; user_id: string; week_start: string; planned_days: number[]; created_at: string }
        Insert: Omit<Database['public']['Tables']['gym_schedules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gym_schedules']['Row']>
      }
      gym_checkins: {
        Row: { id: string; user_id: string; checkin_date: string; went: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['gym_checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gym_checkins']['Row']>
      }
      // Finance
      income_sources: {
        Row: { id: string; user_id: string; name: string; pay_day_of_month: number; default_amount: number; currency: string; active: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['income_sources']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['income_sources']['Row']>
      }
      income_logs: {
        Row: { id: string; user_id: string; source_id: string; received_on: string; amount: number; notes: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['income_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['income_logs']['Row']>
      }
      budget_plans: {
        Row: { id: string; user_id: string; month: string; total_income: number; savings_pct: number; savings_amount: number; status: 'draft' | 'active' | 'closed'; created_at: string }
        Insert: Omit<Database['public']['Tables']['budget_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['budget_plans']['Row']>
      }
      budget_categories: {
        Row: { id: string; plan_id: string; category: string; limit_amount: number; created_at: string }
        Insert: Omit<Database['public']['Tables']['budget_categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['budget_categories']['Row']>
      }
      transactions: {
        Row: { id: string; user_id: string; txn_date: string; type: 'income' | 'expense'; amount: number; category: string; description: string | null; source: 'manual' | 'revolut'; external_id: string | null; plan_id: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Row']>
      }
      savings_goals: {
        Row: { id: string; user_id: string; name: string; target_amount: number; current_amount: number; target_date: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['savings_goals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['savings_goals']['Row']>
      }
      bank_connections: {
        Row: { id: string; user_id: string; provider: string; institution_id: string; account_id: string | null; requisition_id: string; connected_at: string; last_synced_at: string | null; active: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['bank_connections']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bank_connections']['Row']>
      }
      // Habits
      habits: {
        Row: { id: string; user_id: string; name: string; frequency: 'daily' | 'weekly'; color: string | null; archived: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['habits']['Row']>
      }
      habit_completions: {
        Row: { id: string; user_id: string; habit_id: string; completed_on: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['habit_completions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['habit_completions']['Row']>
      }
      goals: {
        Row: { id: string; user_id: string; title: string; description: string | null; target_value: number | null; current_value: number; unit: string | null; due_date: string | null; completed: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['goals']['Row']>
      }
      // Study
      study_modules: {
        Row: { id: string; user_id: string; name: string; total_sections: number; archived: boolean; created_at: string }
        Insert: Omit<Database['public']['Tables']['study_modules']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['study_modules']['Row']>
      }
      study_sections: {
        Row: { id: string; module_id: string; user_id: string; title: string; section_number: number; completed: boolean; completed_on: string | null; difficulty: number | null; notes: string | null; next_review_on: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['study_sections']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['study_sections']['Row']>
      }
      study_sessions: {
        Row: { id: string; user_id: string; module_id: string; section_id: string | null; started_at: string; duration_min: number; notes: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['study_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['study_sessions']['Row']>
      }
    }
  }
}

// Convenience row types
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
export type WeightLog = Database['public']['Tables']['weight_logs']['Row']
export type SleepLog = Database['public']['Tables']['sleep_logs']['Row']
export type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']
export type HydrationLog = Database['public']['Tables']['hydration_logs']['Row']
export type DailySteps = Database['public']['Tables']['daily_steps']['Row']
export type Supplement = Database['public']['Tables']['supplements']['Row']
export type SupplementLog = Database['public']['Tables']['supplement_logs']['Row']
export type GymSchedule = Database['public']['Tables']['gym_schedules']['Row']
export type GymCheckin = Database['public']['Tables']['gym_checkins']['Row']
export type IncomeSource = Database['public']['Tables']['income_sources']['Row']
export type IncomeLog = Database['public']['Tables']['income_logs']['Row']
export type BudgetPlan = Database['public']['Tables']['budget_plans']['Row']
export type BudgetCategory = Database['public']['Tables']['budget_categories']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']
export type BankConnection = Database['public']['Tables']['bank_connections']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitCompletion = Database['public']['Tables']['habit_completions']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type StudyModule = Database['public']['Tables']['study_modules']['Row']
export type StudySection = Database['public']['Tables']['study_sections']['Row']
export type StudySession = Database['public']['Tables']['study_sessions']['Row']
