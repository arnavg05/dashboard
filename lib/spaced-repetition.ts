import { REVIEW_INTERVALS } from './constants'

export function getNextReviewDate(difficulty: number, fromDate?: Date): string {
  const base = fromDate ?? new Date()
  const days = REVIEW_INTERVALS[difficulty] ?? 3
  const next = new Date(base)
  next.setDate(next.getDate() + days)
  return next.toISOString().split('T')[0]
}

export function isDueForReview(nextReviewOn: string | null): boolean {
  if (!nextReviewOn) return false
  const today = new Date().toISOString().split('T')[0]
  return nextReviewOn <= today
}
