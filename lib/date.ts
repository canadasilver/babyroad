function parseLocalDate(dateString: string): Date {
  const datePart = dateString.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)

  if (!year || !month || !day) return new Date(dateString)
  return new Date(year, month - 1, day)
}

export function toISODateString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getAgeInMonthsAtDate(
  birthDate: string,
  targetDate: string = toISODateString()
): number {
  const birth = parseLocalDate(birthDate)
  const target = parseLocalDate(targetDate)

  if (Number.isNaN(birth.getTime()) || Number.isNaN(target.getTime())) return 0
  if (target < birth) return 0

  const yearDiff = target.getFullYear() - birth.getFullYear()
  const monthDiff = target.getMonth() - birth.getMonth()
  const beforeBirthDayInMonth = target.getDate() < birth.getDate() ? 1 : 0

  return Math.max(0, yearDiff * 12 + monthDiff - beforeBirthDayInMonth)
}

export function formatChildAgeFromMonths(months: number): string {
  if (months < 12) return `${months}개월`

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12
  if (remainingMonths === 0) return `${years}세`
  return `${years}세 ${remainingMonths}개월`
}

export function formatChildAge(birthDate: string, targetDate?: string): string {
  return formatChildAgeFromMonths(getAgeInMonthsAtDate(birthDate, targetDate))
}

export function getAgeInMonths(birthDate: string): number {
  return getAgeInMonthsAtDate(birthDate)
}

export function getPregnancyWeeks(dueDate: string): number {
  const due = parseLocalDate(dueDate)
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
  return formatChildAge(child.birthDate)
}

export function formatDate(dateString: string): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  const date = parseLocalDate(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function toLocalDateTimeString(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatSleepDuration(startIso: string, endIso: string | null): string {
  if (!endIso) return '진행 중'

  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (diffMs <= 0) return '-'
  return formatSleepMinutes(Math.floor(diffMs / 60000))
}

export function formatSleepMinutes(minutes: number): string {
  if (minutes <= 0) return '0분'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
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
  return toISODateString(addMonthsToDate(parseLocalDate(birthDate), startMonth))
}

export function getVaccinationEndDate(birthDate: string, endMonth: number): string {
  return toISODateString(addMonthsToDate(parseLocalDate(birthDate), endMonth))
}

export function calculateVaccinationUiStatus(
  birthDate: string,
  startMonth: number,
  endMonth: number,
  isCompleted: boolean
): 'scheduled' | 'available' | 'completed' | 'delayed' {
  if (isCompleted) return 'completed'

  const today = parseLocalDate(toISODateString())
  const birth = parseLocalDate(birthDate)
  const startDate = addMonthsToDate(birth, startMonth)
  const endDate = addMonthsToDate(birth, endMonth)

  if (today < startDate) return 'scheduled'
  if (today > endDate) return 'delayed'
  return 'available'
}
