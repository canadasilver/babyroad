import type { Database } from './database'

export type ChildGender = 'male' | 'female' | 'unknown'
export type ChildStatus = 'pregnancy' | 'born'

export type Child = {
  id: string
  user_id: string
  name: string
  nickname: string | null
  gender: ChildGender
  status: ChildStatus
  due_date: string | null
  birth_date: string | null
  birth_weight: number | null
  birth_height: number | null
  birth_head_circumference: number | null
  profile_image_url: string | null
  is_premature: boolean
  memo: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ChildInsert = Database['public']['Tables']['children']['Insert']
export type ChildUpdate = Database['public']['Tables']['children']['Update']

export type ChildGrowthRecord = {
  id: string
  user_id: string
  child_id: string
  record_date: string
  height: number | null
  weight: number | null
  head_circumference: number | null
  memo: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export type ChildGrowthRecordInsert = Database['public']['Tables']['child_growth_records']['Insert']
export type ChildGrowthRecordUpdate = Database['public']['Tables']['child_growth_records']['Update']
export type ChildFeedingRecord = Database['public']['Tables']['child_feeding_records']['Row']
export type ChildSleepRecord = Database['public']['Tables']['child_sleep_records']['Row']
export type ChildHealthRecord = Database['public']['Tables']['child_health_records']['Row']
export type ChildVaccinationRecord = Database['public']['Tables']['child_vaccination_records']['Row']

export type FeedingType = 'breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water'
export type SleepType = 'day_sleep' | 'night_sleep'
export type VaccinationStatus = 'scheduled' | 'completed' | 'delayed' | 'skipped' | 'consult_required'

export type VaccinationUiStatus = 'scheduled' | 'available' | 'completed' | 'delayed'

export type VaccinationScheduleItem = {
  vaccineId: string
  vaccineName: string
  vaccineDescription: string | null
  isRequired: boolean
  scheduleId: string
  doseLabel: string
  scheduleDescription: string | null
  startMonth: number
  endMonth: number
  scheduledDate: string
  endDate: string
  uiStatus: VaccinationUiStatus
  vaccinatedDate: string | null
  recordId: string | null
}
