export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          nickname: string
          email: string | null
          avatar_url: string | null
          active_child_id: string | null
          provider: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          nickname: string
          email?: string | null
          avatar_url?: string | null
          active_child_id?: string | null
          provider?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          nickname?: string
          email?: string | null
          avatar_url?: string | null
          active_child_id?: string | null
          provider?: string | null
          role?: 'user' | 'admin'
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      children: {
        Row: {
          id: string
          user_id: string
          name: string
          nickname: string | null
          gender: 'male' | 'female' | 'unknown'
          status: 'pregnancy' | 'born'
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
        Insert: {
          id?: string
          user_id: string
          name: string
          nickname?: string | null
          gender?: 'male' | 'female' | 'unknown'
          status?: 'pregnancy' | 'born'
          due_date?: string | null
          birth_date?: string | null
          birth_weight?: number | null
          birth_height?: number | null
          birth_head_circumference?: number | null
          profile_image_url?: string | null
          is_premature?: boolean
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          name?: string
          nickname?: string | null
          gender?: 'male' | 'female' | 'unknown'
          status?: 'pregnancy' | 'born'
          due_date?: string | null
          birth_date?: string | null
          birth_weight?: number | null
          birth_height?: number | null
          birth_head_circumference?: number | null
          profile_image_url?: string | null
          is_premature?: boolean
          memo?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_growth_records: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          child_id: string
          record_date: string
          height?: number | null
          weight?: number | null
          head_circumference?: number | null
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          record_date?: string
          height?: number | null
          weight?: number | null
          head_circumference?: number | null
          memo?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_feeding_records: {
        Row: {
          id: string
          user_id: string
          child_id: string
          recorded_at: string
          feeding_type: 'breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water'
          amount: number | null
          unit: string | null
          food_name: string | null
          reaction: string | null
          memo: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          recorded_at?: string
          feeding_type: 'breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water'
          amount?: number | null
          unit?: string | null
          food_name?: string | null
          reaction?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          recorded_at?: string
          feeding_type?: 'breast_milk' | 'formula' | 'baby_food' | 'solid_food' | 'snack' | 'water'
          amount?: number | null
          unit?: string | null
          food_name?: string | null
          reaction?: string | null
          memo?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_sleep_records: {
        Row: {
          id: string
          user_id: string
          child_id: string
          sleep_start: string
          sleep_end: string | null
          sleep_type: 'day_sleep' | 'night_sleep'
          wake_count: number
          memo: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          sleep_start: string
          sleep_end?: string | null
          sleep_type?: 'day_sleep' | 'night_sleep'
          wake_count?: number
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          sleep_start?: string
          sleep_end?: string | null
          sleep_type?: 'day_sleep' | 'night_sleep'
          wake_count?: number
          memo?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_health_records: {
        Row: {
          id: string
          user_id: string
          child_id: string
          recorded_at: string
          temperature: number | null
          symptoms: string | null
          medicine: string | null
          hospital_name: string | null
          memo: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          recorded_at?: string
          temperature?: number | null
          symptoms?: string | null
          medicine?: string | null
          hospital_name?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          recorded_at?: string
          temperature?: number | null
          symptoms?: string | null
          medicine?: string | null
          hospital_name?: string | null
          memo?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      vaccines: {
        Row: {
          id: string
          name: string
          description: string | null
          is_required: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_required?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          is_required?: boolean
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      vaccine_schedules: {
        Row: {
          id: string
          vaccine_id: string
          start_month: number
          end_month: number
          dose_label: string
          description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          vaccine_id: string
          start_month: number
          end_month: number
          dose_label: string
          description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          vaccine_id?: string
          start_month?: number
          end_month?: number
          dose_label?: string
          description?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_vaccination_records: {
        Row: {
          id: string
          user_id: string
          child_id: string
          vaccine_id: string
          vaccine_schedule_id: string | null
          scheduled_date: string | null
          vaccinated_date: string | null
          status: 'scheduled' | 'completed' | 'delayed' | 'skipped' | 'consult_required'
          hospital_name: string | null
          memo: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          child_id: string
          vaccine_id: string
          vaccine_schedule_id?: string | null
          scheduled_date?: string | null
          vaccinated_date?: string | null
          status?: 'scheduled' | 'completed' | 'delayed' | 'skipped' | 'consult_required'
          hospital_name?: string | null
          memo?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          scheduled_date?: string | null
          vaccinated_date?: string | null
          status?: 'scheduled' | 'completed' | 'delayed' | 'skipped' | 'consult_required'
          hospital_name?: string | null
          memo?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      development_contents: {
        Row: {
          id: string
          start_month: number
          end_month: number
          title: string
          physical: string | null
          language: string | null
          cognitive: string | null
          social: string | null
          feeding: string | null
          sleep: string | null
          play: string | null
          caution: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          start_month: number
          end_month: number
          title: string
          physical?: string | null
          language?: string | null
          cognitive?: string | null
          social?: string | null
          feeding?: string | null
          sleep?: string | null
          play?: string | null
          caution?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          start_month?: number
          end_month?: number
          title?: string
          physical?: string | null
          language?: string | null
          cognitive?: string | null
          social?: string | null
          feeding?: string | null
          sleep?: string | null
          play?: string | null
          caution?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      development_checklists: {
        Row: {
          id: string
          start_month: number
          end_month: number
          category: string
          title: string
          description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          start_month: number
          end_month: number
          category: string
          title: string
          description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          start_month?: number
          end_month?: number
          category?: string
          title?: string
          description?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          child_id: string | null
          category: string
          title: string
          content: string
          image_url: string | null
          author_nickname: string | null
          view_count: number
          like_count: number
          comment_count: number
          status: 'active' | 'hidden' | 'reported' | 'deleted'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          child_id?: string | null
          category: string
          title: string
          content: string
          image_url?: string | null
          author_nickname?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          status?: 'active' | 'hidden' | 'reported' | 'deleted'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          category?: string
          title?: string
          content?: string
          image_url?: string | null
          status?: 'active' | 'hidden' | 'reported' | 'deleted'
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      community_comments: {
        Row: {
          id: string
          user_id: string
          post_id: string
          parent_id: string | null
          content: string
          author_nickname: string | null
          status: 'active' | 'hidden' | 'reported' | 'deleted'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          parent_id?: string | null
          content: string
          author_nickname?: string | null
          status?: 'active' | 'hidden' | 'reported' | 'deleted'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          content?: string
          status?: 'active' | 'hidden' | 'reported' | 'deleted'
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      community_likes: {
        Row: {
          id: string
          user_id: string
          post_id: string
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          post_id: string
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          deleted_at?: string | null
        }
        Relationships: []
      }
      community_reports: {
        Row: {
          id: string
          user_id: string
          post_id: string | null
          comment_id: string | null
          reason: string
          content: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          post_id?: string | null
          comment_id?: string | null
          reason: string
          content?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_collaborators: {
        Row: {
          id: string
          child_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          status: 'pending' | 'active' | 'revoked'
          invited_by: string | null
          accepted_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          child_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          status?: 'pending' | 'active' | 'revoked'
          invited_by?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          role?: 'owner' | 'editor' | 'viewer'
          status?: 'pending' | 'active' | 'revoked'
          invited_by?: string | null
          accepted_at?: string | null
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      child_invites: {
        Row: {
          id: string
          child_id: string
          invited_by: string
          invite_token: string
          role: 'editor' | 'viewer'
          status: 'pending' | 'accepted' | 'expired' | 'revoked'
          expires_at: string
          accepted_by: string | null
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          invited_by: string
          invite_token: string
          role?: 'editor' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          expires_at: string
          accepted_by?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: 'editor' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired' | 'revoked'
          accepted_by?: string | null
          accepted_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          child_id: string | null
          type: string
          title: string
          content: string | null
          scheduled_at: string | null
          sent_at: string | null
          read_at: string | null
          status: 'pending' | 'sent' | 'read' | 'cancelled'
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          child_id?: string | null
          type: string
          title: string
          content?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          read_at?: string | null
          status?: 'pending' | 'sent' | 'read' | 'cancelled'
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          title?: string
          content?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          read_at?: string | null
          status?: 'pending' | 'sent' | 'read' | 'cancelled'
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      growth_standard_percentiles: {
        Row: {
          id: string
          standard_source: string
          sex: 'male' | 'female'
          metric: 'height' | 'weight' | 'head_circumference'
          age_month: number
          p3: number | null
          p15: number | null
          p50: number | null
          p85: number | null
          p97: number | null
          l_value: number | null
          m_value: number | null
          s_value: number | null
          created_at: string
        }
        Insert: {
          id?: string
          standard_source: string
          sex: 'male' | 'female'
          metric: 'height' | 'weight' | 'head_circumference'
          age_month: number
          p3?: number | null
          p15?: number | null
          p50?: number | null
          p85?: number | null
          p97?: number | null
          l_value?: number | null
          m_value?: number | null
          s_value?: number | null
          created_at?: string
        }
        Update: {
          standard_source?: string
          sex?: 'male' | 'female'
          metric?: 'height' | 'weight' | 'head_circumference'
          age_month?: number
          p3?: number | null
          p15?: number | null
          p50?: number | null
          p85?: number | null
          p97?: number | null
          l_value?: number | null
          m_value?: number | null
          s_value?: number | null
        }
        Relationships: []
      }
      development_guides: {
        Row: {
          id: string
          min_month: number
          max_month: number | null
          title: string
          summary: string
          milestones: string[]
          parent_roles: string[]
          play_ideas: string[]
          care_tips: string[]
          caution_notes: string[]
          source_summary: string | null
          source_links: { label: string; url: string }[]
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          min_month: number
          max_month?: number | null
          title: string
          summary: string
          milestones?: string[]
          parent_roles?: string[]
          play_ideas?: string[]
          care_tips?: string[]
          caution_notes?: string[]
          source_summary?: string | null
          source_links?: { label: string; url: string }[]
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          min_month?: number
          max_month?: number | null
          title?: string
          summary?: string
          milestones?: string[]
          parent_roles?: string[]
          play_ideas?: string[]
          care_tips?: string[]
          caution_notes?: string[]
          source_summary?: string | null
          source_links?: { label: string; url: string }[]
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
