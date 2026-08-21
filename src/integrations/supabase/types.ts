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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          cancelled: boolean
          category: string
          created_at: string
          creator_id: string | null
          demo_attendees: Json
          description: string
          host_name: string | null
          id: string
          image_key: string
          is_public: boolean
          kind: Database["public"]["Enums"]["activity_kind"]
          lat: number | null
          lng: number | null
          location_name: string
          location_note: string
          max_participants: number | null
          starts_at: string
          title: string
        }
        Insert: {
          cancelled?: boolean
          category?: string
          created_at?: string
          creator_id?: string | null
          demo_attendees?: Json
          description?: string
          host_name?: string | null
          id?: string
          image_key?: string
          is_public?: boolean
          kind?: Database["public"]["Enums"]["activity_kind"]
          lat?: number | null
          lng?: number | null
          location_name?: string
          location_note?: string
          max_participants?: number | null
          starts_at: string
          title: string
        }
        Update: {
          cancelled?: boolean
          category?: string
          created_at?: string
          creator_id?: string | null
          demo_attendees?: Json
          description?: string
          host_name?: string | null
          id?: string
          image_key?: string
          is_public?: boolean
          kind?: Database["public"]["Enums"]["activity_kind"]
          lat?: number | null
          lng?: number | null
          location_name?: string
          location_note?: string
          max_participants?: number | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      activity_participants: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
          reason: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
          reason: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          activity_id: string | null
          created_at: string
          created_by: string
          id: string
          is_group: boolean
          title: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_group?: boolean
          title?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_group?: boolean
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      deletion_requests: {
        Row: {
          id: string
          purge_after: string
          reason: string | null
          requested_at: string
          user_id: string
        }
        Insert: {
          id?: string
          purge_after?: string
          reason?: string | null
          requested_at?: string
          user_id: string
        }
        Update: {
          id?: string
          purge_after?: string
          reason?: string | null
          requested_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback_messages: {
        Row: {
          created_at: string
          email: string | null
          handled: boolean
          id: string
          kind: string
          message: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          handled?: boolean
          id?: string
          kind: string
          message: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          handled?: boolean
          id?: string
          kind?: string
          message?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      moderation_logs: {
        Row: {
          content: string
          created_at: string
          field: string
          id: string
          matched_terms: string[]
          severity: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          field?: string
          id?: string
          matched_terms?: string[]
          severity?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          field?: string
          id?: string
          matched_terms?: string[]
          severity?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profile_visits: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          birth_date: string | null
          city: string
          consent_at: string | null
          consent_law_enforcement: boolean
          consent_privacy: boolean
          consent_terms: boolean
          consent_visibility: boolean
          created_at: string
          deleted_at: string | null
          first_name: string
          gender: string | null
          id: string
          intent: Database["public"]["Enums"]["intent_type"]
          interests: string[]
          lat: number | null
          lgbtq_badge: boolean
          lgbtq_consent: boolean
          lng: number | null
          onboarded: boolean
          postcode: string | null
          purge_after: string | null
          shadowbanned: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          birth_date?: string | null
          city?: string
          consent_at?: string | null
          consent_law_enforcement?: boolean
          consent_privacy?: boolean
          consent_terms?: boolean
          consent_visibility?: boolean
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          gender?: string | null
          id: string
          intent?: Database["public"]["Enums"]["intent_type"]
          interests?: string[]
          lat?: number | null
          lgbtq_badge?: boolean
          lgbtq_consent?: boolean
          lng?: number | null
          onboarded?: boolean
          postcode?: string | null
          purge_after?: string | null
          shadowbanned?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          birth_date?: string | null
          city?: string
          consent_at?: string | null
          consent_law_enforcement?: boolean
          consent_privacy?: boolean
          consent_terms?: boolean
          consent_visibility?: boolean
          created_at?: string
          deleted_at?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          intent?: Database["public"]["Enums"]["intent_type"]
          interests?: string[]
          lat?: number | null
          lgbtq_badge?: boolean
          lgbtq_consent?: boolean
          lng?: number | null
          onboarded?: boolean
          postcode?: string | null
          purge_after?: string | null
          shadowbanned?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          context: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved: boolean
        }
        Insert: {
          context?: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolved?: boolean
        }
        Update: {
          context?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolved?: boolean
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
      visit_unlocks: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          user_id?: string
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
      is_blocked: { Args: { _a: string; _b: string }; Returns: boolean }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_kind: "friendship" | "date"
      app_role: "admin" | "moderator" | "user"
      intent_type: "friendship" | "dating" | "both"
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
      activity_kind: ["friendship", "date"],
      app_role: ["admin", "moderator", "user"],
      intent_type: ["friendship", "dating", "both"],
    },
  },
} as const
