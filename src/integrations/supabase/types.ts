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
          child_id: string | null
          created_at: string
          doctor_id: string
          id: string
          is_self_booking: boolean | null
          notes: string | null
          parent_id: string
          patient_profile_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          availability_id: string
          child_id?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          is_self_booking?: boolean | null
          notes?: string | null
          parent_id: string
          patient_profile_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          availability_id?: string
          child_id?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          is_self_booking?: boolean | null
          notes?: string | null
          parent_id?: string
          patient_profile_id?: string | null
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
          {
            foreignKeyName: "appointments_patient_profile_id_fkey"
            columns: ["patient_profile_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
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
      doctor_profiles_temp: {
        Row: {
          age: number
          consultation_fees: number | null
          contact_phone: string
          created_at: string
          documents: Json | null
          experience_years: number
          id: string
          name: string
          qualification: string
          rejection_reason: string | null
          sex: string
          specialization: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          consultation_fees?: number | null
          contact_phone: string
          created_at?: string
          documents?: Json | null
          experience_years: number
          id?: string
          name: string
          qualification: string
          rejection_reason?: string | null
          sex: string
          specialization: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          consultation_fees?: number | null
          contact_phone?: string
          created_at?: string
          documents?: Json | null
          experience_years?: number
          id?: string
          name?: string
          qualification?: string
          rejection_reason?: string | null
          sex?: string
          specialization?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      doctors: {
        Row: {
          age: number | null
          bio: string | null
          consultation_fee: number | null
          contact_phone: string | null
          created_at: string
          doctor_profile_temp_id: string | null
          documents: Json | null
          experience_years: number
          id: string
          location: string
          name: string | null
          qualification: string
          sex: string | null
          specialization: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age?: number | null
          bio?: string | null
          consultation_fee?: number | null
          contact_phone?: string | null
          created_at?: string
          doctor_profile_temp_id?: string | null
          documents?: Json | null
          experience_years: number
          id?: string
          location: string
          name?: string | null
          qualification: string
          sex?: string | null
          specialization: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number | null
          bio?: string | null
          consultation_fee?: number | null
          contact_phone?: string | null
          created_at?: string
          doctor_profile_temp_id?: string | null
          documents?: Json | null
          experience_years?: number
          id?: string
          location?: string
          name?: string | null
          qualification?: string
          sex?: string | null
          specialization?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_doctor_profile_temp_id_fkey"
            columns: ["doctor_profile_temp_id"]
            isOneToOne: false
            referencedRelation: "doctor_profiles_temp"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          attachments: Json | null
          created_at: string
          diagnosis: string | null
          doctor_id: string | null
          follow_up_date: string | null
          id: string
          notes: string | null
          patient_id: string
          prescriptions: string | null
          symptoms: string | null
          updated_at: string
          visit_date: string
        }
        Insert: {
          attachments?: Json | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          prescriptions?: string | null
          symptoms?: string | null
          updated_at?: string
          visit_date: string
        }
        Update: {
          attachments?: Json | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string | null
          follow_up_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          prescriptions?: string | null
          symptoms?: string | null
          updated_at?: string
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patient_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      patient_profiles: {
        Row: {
          age: number
          created_at: string
          health_issue: string | null
          id: string
          location: string
          name: string
          sex: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string
          health_issue?: string | null
          id?: string
          location: string
          name: string
          sex: string
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string
          health_issue?: string | null
          id?: string
          location?: string
          name?: string
          sex?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      app_role: "doctor" | "parent" | "user" | "patient" | "admin"
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
      app_role: ["doctor", "parent", "user", "patient", "admin"],
    },
  },
} as const
