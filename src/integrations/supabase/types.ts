export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      generated_blueprints: {
        Row: {
          blueprint_data: Json
          created_at: string
          id: string
          inbound_invite_id: string | null
          share_id: string
          updated_at: string
        }
        Insert: {
          blueprint_data: Json
          created_at?: string
          id?: string
          inbound_invite_id?: string | null
          share_id: string
          updated_at?: string
        }
        Update: {
          blueprint_data?: Json
          created_at?: string
          id?: string
          inbound_invite_id?: string | null
          share_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_blueprints_inbound_invite_id_fkey"
            columns: ["inbound_invite_id"]
            isOneToOne: false
            referencedRelation: "inbound_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      inbound_invites: {
        Row: {
          attendees: Json | null
          created_at: string | null
          description: string | null
          end_time: string
          error: string | null
          id: string
          organizer_email: string
          parsed_data: Json
          processed_at: string | null
          raw_ics: string
          start_time: string
          status: string | null
          summary: string | null
          workshop_id: string | null
        }
        Insert: {
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          end_time: string
          error?: string | null
          id?: string
          organizer_email: string
          parsed_data: Json
          processed_at?: string | null
          raw_ics: string
          start_time: string
          status?: string | null
          summary?: string | null
          workshop_id?: string | null
        }
        Update: {
          attendees?: Json | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          error?: string | null
          id?: string
          organizer_email?: string
          parsed_data?: Json
          processed_at?: string | null
          raw_ics?: string
          start_time?: string
          status?: string | null
          summary?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inbound_invites_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_collaborators: {
        Row: {
          accepted_at: string | null
          email: string
          id: string
          invited_at: string | null
          invited_by: string
          role: string | null
          status: string | null
          user_id: string | null
          workshop_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          email: string
          id?: string
          invited_at?: string | null
          invited_by: string
          role?: string | null
          status?: string | null
          user_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          email?: string
          id?: string
          invited_at?: string | null
          invited_by?: string
          role?: string | null
          status?: string | null
          user_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_collaborators_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_drafts: {
        Row: {
          created_at: string
          current_idx: number | null
          id: string
          updated_at: string
          user_id: string
          versions: Json
          workshop_id: string
        }
        Insert: {
          created_at?: string
          current_idx?: number | null
          id?: string
          updated_at?: string
          user_id: string
          versions?: Json
          workshop_id: string
        }
        Update: {
          created_at?: string
          current_idx?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          versions?: Json
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_drafts_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_whiteboards: {
        Row: {
          blueprint_id: string | null
          canvas_data: string
          created_at: string
          id: string
          updated_at: string
          workshop_id: string
        }
        Insert: {
          blueprint_id?: string | null
          canvas_data: string
          created_at?: string
          id?: string
          updated_at?: string
          workshop_id: string
        }
        Update: {
          blueprint_id?: string | null
          canvas_data?: string
          created_at?: string
          id?: string
          updated_at?: string
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshop_whiteboards_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          constraints: Json | null
          created_at: string | null
          custom_format: string | null
          duration: number | null
          generated_blueprint: Json | null
          id: string
          invitation_source_id: string | null
          metrics: Json | null
          name: string
          owner_id: string
          problem: string | null
          selected_format: Json | null
          selected_model: string | null
          share_id: string
          updated_at: string | null
          workshop_type: string | null
        }
        Insert: {
          constraints?: Json | null
          created_at?: string | null
          custom_format?: string | null
          duration?: number | null
          generated_blueprint?: Json | null
          id?: string
          invitation_source_id?: string | null
          metrics?: Json | null
          name?: string
          owner_id: string
          problem?: string | null
          selected_format?: Json | null
          selected_model?: string | null
          share_id: string
          updated_at?: string | null
          workshop_type?: string | null
        }
        Update: {
          constraints?: Json | null
          created_at?: string | null
          custom_format?: string | null
          duration?: number | null
          generated_blueprint?: Json | null
          id?: string
          invitation_source_id?: string | null
          metrics?: Json | null
          name?: string
          owner_id?: string
          problem?: string | null
          selected_format?: Json | null
          selected_model?: string | null
          share_id?: string
          updated_at?: string | null
          workshop_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_invitation_source_id_fkey"
            columns: ["invitation_source_id"]
            isOneToOne: false
            referencedRelation: "inbound_invites"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
