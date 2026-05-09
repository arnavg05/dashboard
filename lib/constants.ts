export const EXPENSE_CATEGORIES = [
  'Housing', 'Food & Drink', 'Transport', 'Entertainment',
  'Health', 'Shopping', 'Subscriptions', 'Education', 'Other',
] as const

export const WORKOUT_TYPES = [
  'Gym', 'Running', 'Cycling', 'Swimming', 'Yoga', 'HIIT', 'Walking', 'Other',
] as const

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

// Spaced repetition intervals by difficulty (days until next review)
export const REVIEW_INTERVALS: Record<number, number> = {
  1: 7,
  2: 5,
  3: 3,
  4: 2,
  5: 1,
}
