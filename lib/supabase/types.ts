// Types minimales pour la phase 1. À régénérer avec
// `npx supabase gen types typescript --project-id <id>` une fois le schéma
// complet déployé (voir supabase/migrations).

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: "gratuit" | "essentiel" | "business";
          logo_url: string | null;
          brand_color: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          plan?: "gratuit" | "essentiel" | "business";
          logo_url?: string | null;
          brand_color?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: "owner" | "collaborateur";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: "owner" | "collaborateur";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      positioning: {
        Row: {
          organization_id: string;
          ideal_client: string;
          problem: string;
          promise: string;
          offer: string;
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          ideal_client?: string;
          problem?: string;
          promise?: string;
          offer?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["positioning"]["Insert"]>;
        Relationships: [];
      };
      scripts: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          objective: "Attirer" | "Rassurer" | "Convertir";
          duration: 30 | 60 | 90;
          hook: string;
          body: string;
          cta: string;
          status: "brouillon" | "publié";
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          objective: "Attirer" | "Rassurer" | "Convertir";
          duration: 30 | 60 | 90;
          hook: string;
          body: string;
          cta: string;
          status?: "brouillon" | "publié";
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["scripts"]["Insert"]>;
        Relationships: [];
      };
      carousels: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          caption: string;
          slides: string[];
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          caption?: string;
          slides?: string[];
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["carousels"]["Insert"]>;
        Relationships: [];
      };
      coach_messages: {
        Row: {
          id: string;
          organization_id: string;
          role: "user" | "assistant";
          content: string;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          role: "user" | "assistant";
          content: string;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coach_messages"]["Insert"]>;
        Relationships: [];
      };
      usage_counters: {
        Row: {
          id: string;
          organization_id: string;
          metric: string;
          period: string;
          count: number;
        };
        Insert: {
          id?: string;
          organization_id: string;
          metric: string;
          period: string;
          count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["usage_counters"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      try_increment_usage: {
        Args: { p_organization_id: string; p_metric: string; p_limit: number | null };
        Returns: boolean;
      };
      current_usage: {
        Args: { p_organization_id: string; p_metric: string };
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
