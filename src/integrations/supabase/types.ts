export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          availability_id: string
          child_id: string
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          parent_id: string
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          availability_id: string
          child_id: string
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          parent_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          availability_id?: string
          child_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          parent_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_availability_id_fkey"
            columns: ["availability_id"]
            isOneToOne: false
            referencedRelation: "doctor_availability"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          birth_health_issues: string[] | null
          created_at: string
          date_of_birth: string
          gender: string
          id: string
          name: string
          parent_id: string
          place_of_birth: string | null
          updated_at: string
        }
        Insert: {
          birth_health_issues?: string[] | null
          created_at?: string
          date_of_birth: string
          gender: string
          id?: string
          name: string
          parent_id: string
          place_of_birth?: string | null
          updated_at?: string
        }
        Update: {
          birth_health_issues?: string[] | null
          created_at?: string
          date_of_birth?: string
          gender?: string
          id?: string
          name?: string
          parent_id?: string
          place_of_birth?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_availability: {
        Row: {
          available_date: string
          created_at: string
          doctor_id: string
          end_time: string
          id: string
          is_booked: boolean
          start_time: string
        }
        Insert: {
          available_date: string
          created_at?: string
          doctor_id: string
          end_time: string
          id?: string
          is_booked?: boolean
          start_time: string
        }
        Update: {
          available_date?: string
          created_at?: string
          doctor_id?: string
          end_time?: string
          id?: string
          is_booked?: boolean
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_availability_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_patients: {
        Row: {
          allocated_date: string
          child_id: string
          created_at: string
          doctor_id: string
          id: string
        }
        Insert: {
          allocated_date?: string
          child_id: string
          created_at?: string
          doctor_id: string
          id?: string
        }
        Update: {
          allocated_date?: string
          child_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_patients_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_patients_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          bio: string | null
          consultation_fee: number | null
          created_at: string
          experience_years: number
          id: string
          location: string
          qualification: string
          specialization: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years: number
          id?: string
          location: string
          qualification: string
          specialization: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          consultation_fee?: number | null
          created_at?: string
          experience_years?: number
          id?: string
          location?: string
          qualification?: string
          specialization?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      medications: {
        Row: {
          child_id: string
          created_at: string
          doctor_contact: string | null
          doctor_name: string
          dosage: string
          duration: string
          frequency: string
          health_issue: string
          id: string
          medicine_name: string
          notes: string | null
          prescribed_date: string
          updated_at: string
        }
        Insert: {
          child_id: string
          created_at?: string
          doctor_contact?: string | null
          doctor_name: string
          dosage: string
          duration: string
          frequency: string
          health_issue: string
          id?: string
          medicine_name: string
          notes?: string | null
          prescribed_date: string
          updated_at?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          doctor_contact?: string | null
          doctor_name?: string
          dosage?: string
          duration?: string
          frequency?: string
          health_issue?: string
          id?: string
          medicine_name?: string
          notes?: string | null
          prescribed_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_child"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          location: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          location?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccination_records: {
        Row: {
          administered_date: string | null
          child_id: string
          created_at: string
          id: string
          is_completed: boolean | null
          notes: string | null
          schedule_id: string
          updated_at: string
          verified_by: string | null
        }
        Insert: {
          administered_date?: string | null
          child_id: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          schedule_id: string
          updated_at?: string
          verified_by?: string | null
        }
        Update: {
          administered_date?: string | null
          child_id?: string
          created_at?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
          schedule_id?: string
          updated_at?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "vaccination_schedule"
            referencedColumns: ["id"]
          },
        ]
      }
      vaccination_schedule: {
        Row: {
          age_months: number | null
          age_weeks: number | null
          age_years: number | null
          id: string
          is_optional: boolean | null
          purpose: string
          sort_order: number
          vaccine_code: string
          vaccine_name: string
        }
        Insert: {
          age_months?: number | null
          age_weeks?: number | null
          age_years?: number | null
          id?: string
          is_optional?: boolean | null
          purpose: string
          sort_order: number
          vaccine_code: string
          vaccine_name: string
        }
        Update: {
          age_months?: number | null
          age_weeks?: number | null
          age_years?: number | null
          id?: string
          is_optional?: boolean | null
          purpose?: string
          sort_order?: number
          vaccine_code?: string
          vaccine_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "doctor" | "parent" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["doctor", "parent", "user"],
    },
  },
} as const
