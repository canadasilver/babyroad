import type { Database } from './database'

export type Child = Database['public']['Tables']['children']['Row']
export type ChildInsert = Database['public']['Tables']['children']['Insert']
export type ChildUpdate = Database['public']['Tables']['children']['Update']

export type ChildGrowthRecord = Database['public']['Tables']['child_growth_records']['Row']
export type ChildFeedingRecord = Database['public']['Tables']['child_feeding_records']['Row']
export type ChildSleepRecord = Database['public']['Tables']['child_sleep_records']['Row']
export type ChildHealthRecord = Database['public']['Tables']['child_health_records']['Row']
export type ChildVaccinationRecord = Database['public']['Tables']['child_vaccination_records']['Row']

export type ChildGender = 'male' | 'female' | 'unknown'
export type ChildStatus = 'pregnancy' | 'born'
export type FeedingType = 'breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water'
export type SleepType = 'day_sleep' | 'night_sleep'
export type VaccinationStatus = 'scheduled' | 'completed' | 'delayed' | 'skipped' | 'consult_required'
