export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      brands: {
        Row: {
          aliases: string[] | null;
          category: string | null;
          created_at: string | null;
          domain: string | null;
          id: string;
          is_own: boolean | null;
          is_tracked: boolean | null;
          name: string;
          workspace_id: string;
        };
        Insert: {
          aliases?: string[] | null;
          category?: string | null;
          created_at?: string | null;
          domain?: string | null;
          id?: string;
          is_own?: boolean | null;
          is_tracked?: boolean | null;
          name: string;
          workspace_id: string;
        };
        Update: {
          aliases?: string[] | null;
          category?: string | null;
          created_at?: string | null;
          domain?: string | null;
          id?: string;
          is_own?: boolean | null;
          is_tracked?: boolean | null;
          name?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "brands_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_prompt_metrics: {
        Row: {
          avg_position: number | null;
          brand_mentioned_count: number | null;
          date: string;
          llm_id: string;
          prompt_id: string;
          sov_pct: number | null;
          total_runs: number | null;
        };
        Insert: {
          avg_position?: number | null;
          brand_mentioned_count?: number | null;
          date: string;
          llm_id: string;
          prompt_id: string;
          sov_pct?: number | null;
          total_runs?: number | null;
        };
        Update: {
          avg_position?: number | null;
          brand_mentioned_count?: number | null;
          date?: string;
          llm_id?: string;
          prompt_id?: string;
          sov_pct?: number | null;
          total_runs?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_prompt_metrics_llm_id_fkey";
            columns: ["llm_id"];
            isOneToOne: false;
            referencedRelation: "llm_providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "daily_prompt_metrics_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_workspace_metrics: {
        Row: {
          avg_position: number | null;
          brand_consistency_pct: number | null;
          brand_mentions: number | null;
          date: string;
          share_of_voice_pct: number | null;
          total_runs: number | null;
          workspace_id: string;
        };
        Insert: {
          avg_position?: number | null;
          brand_consistency_pct?: number | null;
          brand_mentions?: number | null;
          date: string;
          share_of_voice_pct?: number | null;
          total_runs?: number | null;
          workspace_id: string;
        };
        Update: {
          avg_position?: number | null;
          brand_consistency_pct?: number | null;
          brand_mentions?: number | null;
          date?: string;
          share_of_voice_pct?: number | null;
          total_runs?: number | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_workspace_metrics_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      llm_providers: {
        Row: {
          cost_per_million_input: number | null;
          cost_per_million_output: number | null;
          enabled: boolean | null;
          id: string;
          name: string;
        };
        Insert: {
          cost_per_million_input?: number | null;
          cost_per_million_output?: number | null;
          enabled?: boolean | null;
          id: string;
          name: string;
        };
        Update: {
          cost_per_million_input?: number | null;
          cost_per_million_output?: number | null;
          enabled?: boolean | null;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      mentions: {
        Row: {
          brand_id: string;
          context: string | null;
          detected_via: string | null;
          id: string;
          position: number | null;
          prompt_run_id: string;
          sentiment: string | null;
          sentiment_score: number | null;
        };
        Insert: {
          brand_id: string;
          context?: string | null;
          detected_via?: string | null;
          id?: string;
          position?: number | null;
          prompt_run_id: string;
          sentiment?: string | null;
          sentiment_score?: number | null;
        };
        Update: {
          brand_id?: string;
          context?: string | null;
          detected_via?: string | null;
          id?: string;
          position?: number | null;
          prompt_run_id?: string;
          sentiment?: string | null;
          sentiment_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "mentions_brand_id_fkey";
            columns: ["brand_id"];
            isOneToOne: false;
            referencedRelation: "brands";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mentions_prompt_run_id_fkey";
            columns: ["prompt_run_id"];
            isOneToOne: false;
            referencedRelation: "prompt_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_llms: {
        Row: {
          llm_id: string;
          prompt_id: string;
        };
        Insert: {
          llm_id: string;
          prompt_id: string;
        };
        Update: {
          llm_id?: string;
          prompt_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_llms_llm_id_fkey";
            columns: ["llm_id"];
            isOneToOne: false;
            referencedRelation: "llm_providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_llms_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      prompt_runs: {
        Row: {
          brand_consistency_score: number | null;
          brand_mentioned: boolean | null;
          brand_position: number | null;
          brand_sentiment: string | null;
          cost_usd: number | null;
          date_bucket: string | null;
          error: string | null;
          id: string;
          latency_ms: number | null;
          llm_id: string;
          prompt_id: string;
          ran_at: string | null;
          response_id: string | null;
          status: string;
          total_brands_mentioned: number | null;
        };
        Insert: {
          brand_consistency_score?: number | null;
          brand_mentioned?: boolean | null;
          brand_position?: number | null;
          brand_sentiment?: string | null;
          cost_usd?: number | null;
          date_bucket?: string | null;
          error?: string | null;
          id?: string;
          latency_ms?: number | null;
          llm_id: string;
          prompt_id: string;
          ran_at?: string | null;
          response_id?: string | null;
          status: string;
          total_brands_mentioned?: number | null;
        };
        Update: {
          brand_consistency_score?: number | null;
          brand_mentioned?: boolean | null;
          brand_position?: number | null;
          brand_sentiment?: string | null;
          cost_usd?: number | null;
          date_bucket?: string | null;
          error?: string | null;
          id?: string;
          latency_ms?: number | null;
          llm_id?: string;
          prompt_id?: string;
          ran_at?: string | null;
          response_id?: string | null;
          status?: string;
          total_brands_mentioned?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "prompt_runs_llm_id_fkey";
            columns: ["llm_id"];
            isOneToOne: false;
            referencedRelation: "llm_providers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_runs_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "prompt_runs_response_id_fkey";
            columns: ["response_id"];
            isOneToOne: false;
            referencedRelation: "responses";
            referencedColumns: ["id"];
          },
        ];
      };
      prompts: {
        Row: {
          country: string | null;
          created_at: string | null;
          id: string;
          language: string | null;
          schedule_cron: string | null;
          status: string | null;
          tags: string[] | null;
          text: string;
          updated_at: string | null;
          workspace_id: string;
        };
        Insert: {
          country?: string | null;
          created_at?: string | null;
          id?: string;
          language?: string | null;
          schedule_cron?: string | null;
          status?: string | null;
          tags?: string[] | null;
          text: string;
          updated_at?: string | null;
          workspace_id: string;
        };
        Update: {
          country?: string | null;
          created_at?: string | null;
          id?: string;
          language?: string | null;
          schedule_cron?: string | null;
          status?: string | null;
          tags?: string[] | null;
          text?: string;
          updated_at?: string | null;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "prompts_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      responses: {
        Row: {
          created_at: string | null;
          id: string;
          raw_json: Json | null;
          raw_text: string;
          tokens_in: number | null;
          tokens_out: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          raw_json?: Json | null;
          raw_text: string;
          tokens_in?: number | null;
          tokens_out?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          raw_json?: Json | null;
          raw_text?: string;
          tokens_in?: number | null;
          tokens_out?: number | null;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          domain: string;
          id: string;
          is_owned: boolean | null;
          prompt_run_id: string;
          title: string | null;
          url: string;
        };
        Insert: {
          domain: string;
          id?: string;
          is_owned?: boolean | null;
          prompt_run_id: string;
          title?: string | null;
          url: string;
        };
        Update: {
          domain?: string;
          id?: string;
          is_owned?: boolean | null;
          prompt_run_id?: string;
          title?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sources_prompt_run_id_fkey";
            columns: ["prompt_run_id"];
            isOneToOne: false;
            referencedRelation: "prompt_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      workspace_members: {
        Row: {
          created_at: string | null;
          role: string;
          user_id: string;
          workspace_id: string;
        };
        Insert: {
          created_at?: string | null;
          role?: string;
          user_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string | null;
          role?: string;
          user_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey";
            columns: ["workspace_id"];
            isOneToOne: false;
            referencedRelation: "workspaces";
            referencedColumns: ["id"];
          },
        ];
      };
      workspaces: {
        Row: {
          brand_aliases: string[] | null;
          brand_name: string;
          brand_statement: string | null;
          created_at: string | null;
          default_country: string | null;
          default_language: string | null;
          domain: string | null;
          id: string;
          name: string;
          owner_id: string;
          plan: string | null;
        };
        Insert: {
          brand_aliases?: string[] | null;
          brand_name: string;
          brand_statement?: string | null;
          created_at?: string | null;
          default_country?: string | null;
          default_language?: string | null;
          domain?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          plan?: string | null;
        };
        Update: {
          brand_aliases?: string[] | null;
          brand_name?: string;
          brand_statement?: string | null;
          created_at?: string | null;
          default_country?: string | null;
          default_language?: string | null;
          domain?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          plan?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_manage_workspace: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      is_workspace_member: {
        Args: { target_workspace_id: string };
        Returns: boolean;
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { "": string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
