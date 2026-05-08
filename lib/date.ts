export function getAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate)
  const now = new Date()
  const yearDiff = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  return Math.max(0, yearDiff * 12 + monthDiff)
}

export function getPregnancyWeeks(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const diffWeeks = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 7))
  const pregnancyWeeks = 40 - diffWeeks
  return Math.max(1, Math.min(40, pregnancyWeeks))
}

export function getAgeLabel(child: {
  status: 'pregnancy' | 'born'
  birthDate?: string | null
  dueDate?: string | null
}): string {
  if (child.status === 'pregnancy') {
    if (!child.dueDate) return '임신 중'
    const weeks = getPregnancyWeeks(child.dueDate)
    return `임신 ${weeks}주차`
  }
  if (!child.birthDate) return '출생'
  const months = getAgeInMonths(child.birthDate)
  if (months < 12) return `${months}개월`
  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years}세`
  return `${years}세 ${remainingMonths}개월`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function toISODateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0]
}

function addMonthsToDate(date: Date, months: number): Date {
  const result = new Date(date)
  const originalDay = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(originalDay, lastDay))
  return result
}

export function getVaccinationScheduledDate(birthDate: string, startMonth: number): string {
  return addMonthsToDate(new Date(birthDate), startMonth).toISOString().split('T')[0]
}

export function getVaccinationEndDate(birthDate: string, endMonth: number): string {
  return addMonthsToDate(new Date(birthDate), endMonth).toISOString().split('T')[0]
}

export function calculateVaccinationUiStatus(
  birthDate: string,
  startMonth: number,
  endMonth: number,
  isCompleted: boolean
): 'scheduled' | 'available' | 'completed' | 'delayed' {
  if (isCompleted) return 'completed'

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const birth = new Date(birthDate)
  const startDate = addMonthsToDate(birth, startMonth)
  startDate.setHours(0, 0, 0, 0)
  const endDate = addMonthsToDate(birth, endMonth)
  endDate.setHours(0, 0, 0, 0)

  if (today < startDate) return 'scheduled'
  if (today > endDate) return 'delayed'
  return 'available'
}
