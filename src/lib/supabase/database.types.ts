export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      answers: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          label: string;
          sort_order: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          label: string;
          sort_order?: number;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          created_at: string;
          day: string;
          id: string;
          mood: Database["public"]["Enums"]["mood"];
          note: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          day: string;
          id?: string;
          mood: Database["public"]["Enums"]["mood"];
          note?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          day?: string;
          id?: string;
          mood?: Database["public"]["Enums"]["mood"];
          note?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      job_events: {
        Row: {
          from_status: Database["public"]["Enums"]["job_status"] | null;
          id: string;
          job_id: string;
          occurred_at: string;
          to_status: Database["public"]["Enums"]["job_status"] | null;
          type: Database["public"]["Enums"]["job_event_type"];
          user_id: string;
        };
        Insert: {
          from_status?: Database["public"]["Enums"]["job_status"] | null;
          id?: string;
          job_id: string;
          occurred_at?: string;
          to_status?: Database["public"]["Enums"]["job_status"] | null;
          type: Database["public"]["Enums"]["job_event_type"];
          user_id?: string;
        };
        Update: {
          from_status?: Database["public"]["Enums"]["job_status"] | null;
          id?: string;
          job_id?: string;
          occurred_at?: string;
          to_status?: Database["public"]["Enums"]["job_status"] | null;
          type?: Database["public"]["Enums"]["job_event_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_events_job_id_user_id_fkey";
            columns: ["job_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      jobs: {
        Row: {
          applied_at: string | null;
          company: string | null;
          created_at: string;
          id: string;
          notes: string | null;
          platform: Database["public"]["Enums"]["job_platform"];
          status: Database["public"]["Enums"]["job_status"];
          title: string | null;
          updated_at: string;
          url: string | null;
          user_id: string;
        };
        Insert: {
          applied_at?: string | null;
          company?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          platform?: Database["public"]["Enums"]["job_platform"];
          status?: Database["public"]["Enums"]["job_status"];
          title?: string | null;
          updated_at?: string;
          url?: string | null;
          user_id?: string;
        };
        Update: {
          applied_at?: string | null;
          company?: string | null;
          created_at?: string;
          id?: string;
          notes?: string | null;
          platform?: Database["public"]["Enums"]["job_platform"];
          status?: Database["public"]["Enums"]["job_status"];
          title?: string | null;
          updated_at?: string;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      saved_searches: {
        Row: {
          created_at: string;
          id: string;
          label: string;
          sort_order: number;
          url: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          label: string;
          sort_order?: number;
          url: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          label?: string;
          sort_order?: number;
          url?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          challenge_start_date: string;
          created_at: string;
          timezone: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          challenge_start_date: string;
          created_at?: string;
          timezone: string;
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          challenge_start_date?: string;
          created_at?: string;
          timezone?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      targets: {
        Row: {
          created_at: string;
          daily_apply_target: number;
          effective_from: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          daily_apply_target: number;
          effective_from: string;
          id?: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          daily_apply_target?: number;
          effective_from?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      job_event_type: "status_change" | "follow_up_sent";
      job_platform:
        "linkedin" | "indeed" | "naukri" | "wellfound" | "company_site" | "referral" | "other";
      job_status: "inbox" | "applied" | "response" | "interview" | "offer" | "rejected" | "ghosted";
      mood: "great" | "good" | "okay" | "low" | "bad";
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      job_event_type: ["status_change", "follow_up_sent"],
      job_platform: [
        "linkedin",
        "indeed",
        "naukri",
        "wellfound",
        "company_site",
        "referral",
        "other",
      ],
      job_status: ["inbox", "applied", "response", "interview", "offer", "rejected", "ghosted"],
      mood: ["great", "good", "okay", "low", "bad"],
    },
  },
} as const;
