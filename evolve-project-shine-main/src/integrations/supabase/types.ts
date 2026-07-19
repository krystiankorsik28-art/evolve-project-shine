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
      ai_gradings: {
        Row: {
          accepted: boolean | null
          accepted_by: string | null
          ai_score: number
          answer_id: string
          attempt_id: string
          confidence: number | null
          created_at: string | null
          feedback: string | null
          id: string
          max_score: number
          question_id: string
          rubric: Json | null
        }
        Insert: {
          accepted?: boolean | null
          accepted_by?: string | null
          ai_score?: number
          answer_id: string
          attempt_id: string
          confidence?: number | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          max_score?: number
          question_id: string
          rubric?: Json | null
        }
        Update: {
          accepted?: boolean | null
          accepted_by?: string | null
          ai_score?: number
          answer_id?: string
          attempt_id?: string
          confidence?: number | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          max_score?: number
          question_id?: string
          rubric?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_gradings_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_gradings_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_gradings_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_library_chunks: {
        Row: {
          content: string
          created_at: string | null
          id: string
          material_id: string | null
          owner_id: string
          search_tsv: unknown
          summary: string | null
          tags: string[] | null
          title: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          material_id?: string | null
          owner_id: string
          search_tsv?: unknown
          summary?: string | null
          tags?: string[] | null
          title?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          material_id?: string | null
          owner_id?: string
          search_tsv?: unknown
          summary?: string | null
          tags?: string[] | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_library_chunks_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_predictions: {
        Row: {
          analysis: string | null
          created_at: string | null
          exam_id: string | null
          id: string
          predicted_score: number | null
          recommendations: string[] | null
          risk_level: string | null
          strengths: string[] | null
          student_id: string
          weaknesses: string[] | null
        }
        Insert: {
          analysis?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          predicted_score?: number | null
          recommendations?: string[] | null
          risk_level?: string | null
          strengths?: string[] | null
          student_id: string
          weaknesses?: string[] | null
        }
        Update: {
          analysis?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          predicted_score?: number | null
          recommendations?: string[] | null
          risk_level?: string | null
          strengths?: string[] | null
          student_id?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_predictions_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parts: Json | null
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parts?: Json | null
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parts?: Json | null
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_tutor_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "ai_tutor_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tutor_threads: {
        Row: {
          created_at: string | null
          id: string
          subject: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          subject?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          attachments: Json
          body: string
          class_id: string | null
          created_at: string
          created_by: string
          id: string
          pinned: boolean
          priority: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          body: string
          class_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          pinned?: boolean
          priority?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          body?: string
          class_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          pinned?: boolean
          priority?: string
          published?: boolean
          title?: string
          updated_at?: string
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
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          feedback: string | null
          file_path: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          student_id: string | null
          student_name: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          feedback?: string | null
          file_path?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          student_name: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          feedback?: string | null
          file_path?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          student_name?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachments: Json
          class_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_at: string | null
          id: string
          max_score: number
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: Json
          class_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_at?: string | null
          id?: string
          max_score?: number
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: Json
          class_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_at?: string | null
          id?: string
          max_score?: number
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_live_state: {
        Row: {
          answered_count: number
          attempt_id: string
          blur_count: number
          copy_count: number
          current_question: number
          exam_id: string
          forbidden_key_count: number
          fullscreen_on: boolean
          heartbeat_count: number
          last_event_at: string | null
          last_event_type: string | null
          paste_count: number
          right_click_count: number
          student_name: string | null
          suspicion_score: number
          tab_hidden_count: number
          total_questions: number
          updated_at: string
        }
        Insert: {
          answered_count?: number
          attempt_id: string
          blur_count?: number
          copy_count?: number
          current_question?: number
          exam_id: string
          forbidden_key_count?: number
          fullscreen_on?: boolean
          heartbeat_count?: number
          last_event_at?: string | null
          last_event_type?: string | null
          paste_count?: number
          right_click_count?: number
          student_name?: string | null
          suspicion_score?: number
          tab_hidden_count?: number
          total_questions?: number
          updated_at?: string
        }
        Update: {
          answered_count?: number
          attempt_id?: string
          blur_count?: number
          copy_count?: number
          current_question?: number
          exam_id?: string
          forbidden_key_count?: number
          fullscreen_on?: boolean
          heartbeat_count?: number
          last_event_at?: string | null
          last_event_type?: string | null
          paste_count?: number
          right_click_count?: number
          student_name?: string | null
          suspicion_score?: number
          tab_hidden_count?: number
          total_questions?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_live_state_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: true
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_live_state_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_screen_frames: {
        Row: {
          attempt_id: string
          created_at: string
          exam_id: string
          id: string
          image_data: string
        }
        Insert: {
          attempt_id: string
          created_at?: string
          exam_id: string
          id?: string
          image_data: string
        }
        Update: {
          attempt_id?: string
          created_at?: string
          exam_id?: string
          id?: string
          image_data?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempt_screen_frames_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_screen_frames_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "exams"
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
      badges: {
        Row: {
          code: string
          color: string | null
          condition: Json | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          xp_reward: number | null
        }
        Insert: {
          code: string
          color?: string | null
          condition?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          xp_reward?: number | null
        }
        Update: {
          code?: string
          color?: string | null
          condition?: Json | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          class_id: string | null
          color: string | null
          created_at: string
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          kind: string
          related_id: string | null
          starts_at: string
          title: string
        }
        Insert: {
          class_id?: string | null
          color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          related_id?: string | null
          starts_at: string
          title: string
        }
        Update: {
          class_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          kind?: string
          related_id?: string | null
          starts_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      class_students: {
        Row: {
          class_id: string
          created_at: string
          id: string
          student_name: string | null
          student_user_id: string | null
        }
        Insert: {
          class_id: string
          created_at?: string
          id?: string
          student_name?: string | null
          student_user_id?: string | null
        }
        Update: {
          class_id?: string
          created_at?: string
          id?: string
          student_name?: string | null
          student_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          color: string
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
          year: string
        }
        Insert: {
          color?: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
          year?: string
        }
        Update: {
          color?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
          year?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          topic: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          topic?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
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
      forum_posts: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          category: string
          created_at: string
          created_by: string
          id: string
          locked: boolean
          pinned: boolean
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by: string
          id?: string
          locked?: boolean
          pinned?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          id?: string
          locked?: boolean
          pinned?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      grade_exports: {
        Row: {
          class_id: string | null
          created_at: string
          created_by: string
          exam_id: string | null
          format: string
          id: string
          metadata: Json
          name: string
          row_count: number
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          created_by: string
          exam_id?: string | null
          format?: string
          id?: string
          metadata?: Json
          name: string
          row_count?: number
        }
        Update: {
          class_id?: string | null
          created_at?: string
          created_by?: string
          exam_id?: string | null
          format?: string
          id?: string
          metadata?: Json
          name?: string
          row_count?: number
        }
        Relationships: []
      }
      journal_activity_log: {
        Row: {
          action: string
          actor_id: string | null
          class_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          summary: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          class_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          summary: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          class_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_activity_log_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_attendance: {
        Row: {
          created_by: string
          id: string
          lesson_id: string
          minutes_late: number
          note: string | null
          recorded_at: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_by: string
          id?: string
          lesson_id: string
          minutes_late?: number
          note?: string | null
          recorded_at?: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_by?: string
          id?: string
          lesson_id?: string
          minutes_late?: number
          note?: string | null
          recorded_at?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_attendance_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "journal_lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "class_students"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_grades: {
        Row: {
          category: string
          class_id: string
          comment: string | null
          created_at: string
          created_by: string
          graded_at: string
          id: string
          max_points: number | null
          points: number | null
          student_id: string
          subject: string
          title: string
          updated_at: string
          value: number
          visible_to_student: boolean
          weight: number
        }
        Insert: {
          category?: string
          class_id: string
          comment?: string | null
          created_at?: string
          created_by: string
          graded_at?: string
          id?: string
          max_points?: number | null
          points?: number | null
          student_id: string
          subject: string
          title: string
          updated_at?: string
          value: number
          visible_to_student?: boolean
          weight?: number
        }
        Update: {
          category?: string
          class_id?: string
          comment?: string | null
          created_at?: string
          created_by?: string
          graded_at?: string
          id?: string
          max_points?: number | null
          points?: number | null
          student_id?: string
          subject?: string
          title?: string
          updated_at?: string
          value?: number
          visible_to_student?: boolean
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "journal_grades_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "class_students"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_lessons: {
        Row: {
          class_id: string
          created_at: string
          created_by: string
          ends_at: string | null
          id: string
          notes: string | null
          room: string | null
          starts_at: string
          status: string
          subject: string
          topic: string
          updated_at: string
        }
        Insert: {
          class_id: string
          created_at?: string
          created_by: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          room?: string | null
          starts_at: string
          status?: string
          subject: string
          topic: string
          updated_at?: string
        }
        Update: {
          class_id?: string
          created_at?: string
          created_by?: string
          ends_at?: string | null
          id?: string
          notes?: string | null
          room?: string | null
          starts_at?: string
          status?: string
          subject?: string
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_notes: {
        Row: {
          body: string | null
          class_id: string
          created_at: string
          created_by: string
          event_date: string
          id: string
          kind: string
          points: number
          student_id: string
          title: string
          updated_at: string
          visible_to_student: boolean
        }
        Insert: {
          body?: string | null
          class_id: string
          created_at?: string
          created_by: string
          event_date?: string
          id?: string
          kind?: string
          points?: number
          student_id: string
          title: string
          updated_at?: string
          visible_to_student?: boolean
        }
        Update: {
          body?: string | null
          class_id?: string
          created_at?: string
          created_by?: string
          event_date?: string
          id?: string
          kind?: string
          points?: number
          student_id?: string
          title?: string
          updated_at?: string
          visible_to_student?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "journal_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "class_students"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          ai_generated: boolean | null
          class_id: string | null
          content: Json | null
          created_at: string | null
          created_by: string
          duration_minutes: number | null
          homework: string | null
          id: string
          materials: string[] | null
          objectives: string[] | null
          scheduled_at: string | null
          status: string | null
          subject: string | null
          title: string
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          class_id?: string | null
          content?: Json | null
          created_at?: string | null
          created_by: string
          duration_minutes?: number | null
          homework?: string | null
          id?: string
          materials?: string[] | null
          objectives?: string[] | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          title: string
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          class_id?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string
          duration_minutes?: number | null
          homework?: string | null
          id?: string
          materials?: string[] | null
          objectives?: string[] | null
          scheduled_at?: string | null
          status?: string | null
          subject?: string | null
          title?: string
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plans_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      live_participants: {
        Row: {
          answers: Json
          id: string
          joined_at: string
          nickname: string
          score: number
          session_id: string
        }
        Insert: {
          answers?: Json
          id?: string
          joined_at?: string
          nickname: string
          score?: number
          session_id: string
        }
        Update: {
          answers?: Json
          id?: string
          joined_at?: string
          nickname?: string
          score?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "live_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "live_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      live_sessions: {
        Row: {
          created_at: string
          created_by: string
          current_question_index: number
          ended_at: string | null
          id: string
          pin_code: string
          question_started_at: string | null
          questions: Json
          shuffle_questions: boolean | null
          started_at: string | null
          status: string
          time_bonus: boolean | null
          time_per_question: number | null
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_question_index?: number
          ended_at?: string | null
          id?: string
          pin_code: string
          question_started_at?: string | null
          questions?: Json
          shuffle_questions?: boolean | null
          started_at?: string | null
          status?: string
          time_bonus?: boolean | null
          time_per_question?: number | null
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_question_index?: number
          ended_at?: string | null
          id?: string
          pin_code?: string
          question_started_at?: string | null
          questions?: Json
          shuffle_questions?: boolean | null
          started_at?: string | null
          status?: string
          time_bonus?: boolean | null
          time_per_question?: number | null
          title?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          created_at: string
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
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
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
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
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
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_id: string
          id: string
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          id?: string
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
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
      user_xp: {
        Row: {
          last_activity_at: string | null
          level: number
          streak_days: number | null
          updated_at: string | null
          user_id: string
          xp: number
        }
        Insert: {
          last_activity_at?: string | null
          level?: number
          streak_days?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number
        }
        Update: {
          last_activity_at?: string | null
          level?: number
          streak_days?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      event_risk_weight: { Args: { _event_type: string }; Returns: number }
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
      attempt_status: "in_progress" | "submitted" | "graded" | "aborted"
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
      attempt_status: ["in_progress", "submitted", "graded", "aborted"],
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
