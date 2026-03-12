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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          cpf_cnpj: string | null
          phone: string | null
          account_type: 'individual' | 'business'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          cpf_cnpj?: string | null
          phone?: string | null
          account_type?: 'individual' | 'business'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          cpf_cnpj?: string | null
          phone?: string | null
          account_type?: 'individual' | 'business'
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
          status: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type?: 'free' | 'basic' | 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'free' | 'basic' | 'pro' | 'enterprise'
          status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          key_hash: string
          name: string
          permissions: 'read' | 'full'
          is_active: boolean
          last_used_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          key_hash: string
          name: string
          permissions?: 'read' | 'full'
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          key_hash?: string
          name?: string
          permissions?: 'read' | 'full'
          is_active?: boolean
          last_used_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_usage_logs: {
        Row: {
          id: string
          user_id: string
          api_key_id: string
          endpoint: string
          method: string
          status_code: number
          response_time: number
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          api_key_id: string
          endpoint: string
          method: string
          status_code: number
          response_time: number
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          api_key_id?: string
          endpoint?: string
          method?: string
          status_code?: number
          response_time?: number
          ip_address?: string | null
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
          requests_per_minute: number
          requests_per_day: number
          requests_per_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_type: 'free' | 'basic' | 'pro' | 'enterprise'
          requests_per_minute: number
          requests_per_day: number
          requests_per_month: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_type?: 'free' | 'basic' | 'pro' | 'enterprise'
          requests_per_minute?: number
          requests_per_day?: number
          requests_per_month?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
