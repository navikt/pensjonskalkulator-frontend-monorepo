export function getPreviousMonth(): string {
  const today = new Date()
  const currentMonth = parseInt(
    today.toLocaleDateString('en-CA').slice(5, 7),
    10
  ) // Extracts the month from the date string
  const previousMonth = currentMonth - 1
  return previousMonth.toString()
}
