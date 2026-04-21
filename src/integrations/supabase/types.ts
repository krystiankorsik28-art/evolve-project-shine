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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          audience: Database["public"]["Enums"]["app_role"] | null
          body: string
          created_at: string
          created_by: string
          id: string
          published: boolean
          title: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          body: string
          created_at?: string
          created_by: string
          id?: string
          published?: boolean
          title: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["app_role"] | null
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      answers: {
        Row: {
          ai_feedback: string | null
          answered_at: string
          attempt_id: string
          graded_by_ai: boolean
          id: string
          is_correct: boolean | null
          points_awarded: number | null
          question_id: string
          response: Json | null
        }
        Insert: {
          ai_feedback?: string | null
          answered_at?: string
          attempt_id: string
          graded_by_ai?: boolean
          id?: string
          is_correct?: boolean | null
          points_awarded?: number | null
          question_id: string
          response?: Json | null
        }
        Update: {
          ai_feedback?: string | null
          answered_at?: string
          attempt_id?: string
          graded_by_ai?: boolean
          id?: string
          is_correct?: boolean | null
          points_awarded?: number | null
          question_id?: string
          response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          created_at: string
          exam_id: string
          graded_at: string | null
          id: string
          max_score: number | null
          passed: boolean | null
          percent: number | null
          pin_id: string | null
          proctoring_data: Json | null
          score: number | null
          started_at: string
          status: Database["public"]["Enums"]["attempt_status"]
          student_id: string | null
          student_name: string
          submitted_at: string | null
        }
        Insert: {
          created_at?: string
          exam_id: string
          graded_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percent?: number | null
          pin_id?: string | null
          proctoring_data?: Json | null
          score?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id?: string | null
          student_name: string
          submitted_at?: string | null
        }
        Update: {
          created_at?: string
          exam_id?: string
          graded_at?: string | null
          id?: string
          max_score?: number | null
          passed?: boolean | null
          percent?: number | null
          pin_id?: string | null
          proctoring_data?: Json | null
          score?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["attempt_status"]
          student_id?: string | null
          student_name?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_pin_id_fkey"
            columns: ["pin_id"]
            isOneToOne: false
            referencedRelation: "exam_pins"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      exam_pins: {
        Row: {
          active: boolean
          created_at: string
          created_by: string
          exam_id: string
          expires_at: string | null
          id: string
          max_uses: number | null
          pin_code: string
          used_count: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by: string
          exam_id: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          pin_code: string
          used_count?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by?: string
          exam_id?: string
          expires_at?: string | null
          id?: string
          max_uses?: number | null
          pin_code?: string
          used_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_pins_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_schedules: {
        Row: {
          created_at: string
          created_by: string
          duration_minutes: number
          exam_id: string
          id: string
          notes: string | null
          scheduled_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          duration_minutes?: number
          exam_id: string
          id?: string
          notes?: string | null
          scheduled_at: string
        }
        Update: {
          created_at?: string
          created_by?: string
          duration_minutes?: number
          exam_id?: string
          id?: string
          notes?: string | null
          scheduled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_schedules_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exams: {
        Row: {
          adaptive: boolean
          available_from: string | null
          available_until: string | null
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number
          id: string
          passing_score: number
          show_results: boolean
          shuffle_questions: boolean
          status: Database["public"]["Enums"]["exam_status"]
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          adaptive?: boolean
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number
          id?: string
          passing_score?: number
          show_results?: boolean
          shuffle_questions?: boolean
          status?: Database["public"]["Enums"]["exam_status"]
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          adaptive?: boolean
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          passing_score?: number
          show_results?: boolean
          shuffle_questions?: boolean
          status?: Database["public"]["Enums"]["exam_status"]
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          subject: string | null
          title: string
          uploaded_by: string
          visible_to_students: boolean
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          subject?: string | null
          title: string
          uploaded_by: string
          visible_to_students?: boolean
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          subject?: string | null
          title?: string
          uploaded_by?: string
          visible_to_students?: boolean
        }
        Relationships: []
      }
      proctoring_events: {
        Row: {
          attempt_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          attempt_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          attempt_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_events_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          language: string
          last_name: string | null
          phone: string | null
          two_factor_enabled: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          language?: string
          last_name?: string | null
          phone?: string | null
          two_factor_enabled?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          language?: string
          last_name?: string | null
          phone?: string | null
          two_factor_enabled?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_bank: {
        Row: {
          ai_generated: boolean
          ai_validated: boolean
          category_id: string | null
          correct_answer: Json | null
          created_at: string
          created_by: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          explanation: string | null
          id: string
          language: string
          media_url: string | null
          options: Json | null
          points: number
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          updated_at: string
          usage_count: number
        }
        Insert: {
          ai_generated?: boolean
          ai_validated?: boolean
          category_id?: string | null
          correct_answer?: Json | null
          created_at?: string
          created_by: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          language?: string
          media_url?: string | null
          options?: Json | null
          points?: number
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
          usage_count?: number
        }
        Update: {
          ai_generated?: boolean
          ai_validated?: boolean
          category_id?: string | null
          correct_answer?: Json | null
          created_at?: string
          created_by?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          explanation?: string | null
          id?: string
          language?: string
          media_url?: string | null
          options?: Json | null
          points?: number
          prompt?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "question_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      question_bank_tags: {
        Row: {
          question_id: string
          tag_id: string
        }
        Insert: {
          question_id: string
          tag_id: string
        }
        Update: {
          question_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_bank_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_bank"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_bank_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "question_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      question_categories: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      question_tags: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          ai_generated: boolean
          correct_answer: Json | null
          created_at: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          exam_id: string
          explanation: string | null
          id: string
          media_url: string | null
          options: Json | null
          order_index: number
          points: number
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          updated_at: string
        }
        Insert: {
          ai_generated?: boolean
          correct_answer?: Json | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_id: string
          explanation?: string | null
          id?: string
          media_url?: string | null
          options?: Json | null
          order_index?: number
          points?: number
          prompt: string
          question_type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Update: {
          ai_generated?: boolean
          correct_answer?: Json | null
          created_at?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          exam_id?: string
          explanation?: string | null
          id?: string
          media_url?: string | null
          options?: Json | null
          order_index?: number
          points?: number
          prompt?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          rejection_reason: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_approved_teacher: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "teacher" | "student"
      approval_status: "pending" | "approved" | "rejected"
      attempt_status: "in_progress" | "submitted" | "graded"
      difficulty_level: "easy" | "medium" | "hard"
      exam_status: "draft" | "published" | "archived"
      question_type:
        | "single_choice"
        | "multiple_choice"
        | "true_false"
        | "short_answer"
        | "essay"
        | "matching"
        | "drag_drop"
        | "fill_in_blank"
        | "ordering"
        | "numeric"
        | "code"
        | "hotspot"
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
      app_role: ["admin", "teacher", "student"],
      approval_status: ["pending", "approved", "rejected"],
      attempt_status: ["in_progress", "submitted", "graded"],
      difficulty_level: ["easy", "medium", "hard"],
      exam_status: ["draft", "published", "archived"],
      question_type: [
        "single_choice",
        "multiple_choice",
        "true_false",
        "short_answer",
        "essay",
        "matching",
        "drag_drop",
        "fill_in_blank",
        "ordering",
        "numeric",
        "code",
        "hotspot",
      ],
    },
  },
} as const
