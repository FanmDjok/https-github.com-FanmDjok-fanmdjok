// Types Database maintenues à la main pour préserver les unions littérales
// (statuts, réseaux, formules...) utilisées dans tout le code applicatif —
// `npx supabase gen types typescript` ne peut pas les inférer depuis de
// simples contraintes CHECK et les remplace par `string`. Les métadonnées
// `Relationships` ci-dessous, elles, sont synchronisées avec le schéma réel
// du projet uzbkluwxgmlvbklfjbor (régénérées via le connecteur MCP Supabase
// après déploiement des migrations 0001 à 0006).

export type LinkButton = { id: string; label: string; url: string; code?: string };
export type LeadMagnetSection = { title: string; body: string };

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
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
        Relationships: [
          {
            foreignKeyName: "positioning_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "scripts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "carousels_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "coach_messages_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "usage_counters_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      link_pages: {
        Row: {
          organization_id: string;
          slug: string;
          display_name: string;
          bio: string;
          brand_color: string;
          buttons: LinkButton[];
          updated_at: string;
        };
        Insert: {
          organization_id: string;
          slug: string;
          display_name?: string;
          bio?: string;
          brand_color?: string;
          buttons?: LinkButton[];
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["link_pages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "link_pages_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: true;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      lead_magnets: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          type: "Checklist" | "Guide PDF" | "Mini-formation";
          outline: LeadMagnetSection[];
          status: "brouillon" | "publié";
          storage_path: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          type: "Checklist" | "Guide PDF" | "Mini-formation";
          outline?: LeadMagnetSection[];
          status?: "brouillon" | "publié";
          storage_path?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["lead_magnets"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "lead_magnets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          email: string;
          consent: boolean;
          source: string;
          network: string | null;
          lead_magnet_id: string | null;
          tracked_link_id: string | null;
          status: "Nouveau" | "Contacté" | "Client";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          email: string;
          consent: boolean;
          source?: string;
          network?: string | null;
          lead_magnet_id?: string | null;
          tracked_link_id?: string | null;
          status?: "Nouveau" | "Contacté" | "Client";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "leads_lead_magnet_id_fkey";
            columns: ["lead_magnet_id"];
            isOneToOne: false;
            referencedRelation: "lead_magnets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_tracked_link_id_fkey";
            columns: ["tracked_link_id"];
            isOneToOne: false;
            referencedRelation: "tracked_links";
            referencedColumns: ["id"];
          },
        ];
      };
      tracked_links: {
        Row: {
          id: string;
          organization_id: string;
          code: string;
          label: string;
          target_url: string;
          clicks: number;
          post_target_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          code: string;
          label: string;
          target_url: string;
          clicks?: number;
          post_target_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tracked_links"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "tracked_links_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tracked_links_post_target_id_fkey";
            columns: ["post_target_id"];
            isOneToOne: false;
            referencedRelation: "post_targets";
            referencedColumns: ["id"];
          },
        ];
      };
      social_accounts: {
        Row: {
          id: string;
          organization_id: string;
          network: "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube";
          external_account_id: string;
          label: string | null;
          access_token_encrypted: string;
          refresh_token_encrypted: string | null;
          expires_at: string | null;
          status: "connecté" | "à reconnecter" | "non connecté";
          meta: Record<string, unknown>;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          network: "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube";
          external_account_id: string;
          label?: string | null;
          access_token_encrypted: string;
          refresh_token_encrypted?: string | null;
          expires_at?: string | null;
          status?: "connecté" | "à reconnecter" | "non connecté";
          meta?: Record<string, unknown>;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["social_accounts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "social_accounts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      media_assets: {
        Row: {
          id: string;
          organization_id: string;
          storage_path: string;
          type: "image" | "vidéo";
          duration_seconds: number | null;
          width: number | null;
          height: number | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          storage_path: string;
          type: "image" | "vidéo";
          duration_seconds?: number | null;
          width?: number | null;
          height?: number | null;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "media_assets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          caption: string;
          media_asset_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title?: string;
          caption?: string;
          media_asset_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "posts_media_asset_id_fkey";
            columns: ["media_asset_id"];
            isOneToOne: false;
            referencedRelation: "media_assets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      post_targets: {
        Row: {
          id: string;
          post_id: string;
          organization_id: string;
          network: "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube";
          caption_override: string | null;
          status: "en_attente" | "en_cours" | "publié" | "échec" | "sans_connexion";
          scheduled_at: string;
          external_id: string | null;
          external_url: string | null;
          error: string | null;
          attempts: number;
          last_synced_at: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          organization_id: string;
          network: "instagram" | "facebook" | "tiktok" | "linkedin" | "youtube";
          caption_override?: string | null;
          status?: "en_attente" | "en_cours" | "publié" | "échec" | "sans_connexion";
          scheduled_at?: string;
          external_id?: string | null;
          external_url?: string | null;
          error?: string | null;
          attempts?: number;
          last_synced_at?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["post_targets"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "post_targets_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_targets_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
        ];
      };
      post_metrics: {
        Row: {
          id: string;
          post_target_id: string;
          organization_id: string;
          captured_at: string;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          clicks: number;
        };
        Insert: {
          id?: string;
          post_target_id: string;
          organization_id: string;
          captured_at?: string;
          views?: number;
          likes?: number;
          comments?: number;
          shares?: number;
          saves?: number;
          clicks?: number;
        };
        Update: Partial<Database["public"]["Tables"]["post_metrics"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "post_metrics_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_metrics_post_target_id_fkey";
            columns: ["post_target_id"];
            isOneToOne: false;
            referencedRelation: "post_targets";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          type: string;
          message: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          type: string;
          message: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      current_post_metrics: {
        Row: {
          post_target_id: string;
          organization_id: string;
          captured_at: string;
          views: number;
          likes: number;
          comments: number;
          shares: number;
          saves: number;
          clicks: number;
        };
        Relationships: [
          {
            foreignKeyName: "post_metrics_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "post_metrics_post_target_id_fkey";
            columns: ["post_target_id"];
            isOneToOne: false;
            referencedRelation: "post_targets";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      try_increment_usage: {
        Args: { p_organization_id: string; p_metric: string; p_limit: number | null };
        Returns: boolean;
      };
      current_usage: {
        Args: { p_organization_id: string; p_metric: string };
        Returns: number;
      };
      get_public_link_page: {
        Args: { p_slug: string };
        Returns: {
          organization_id: string;
          display_name: string;
          bio: string;
          brand_color: string;
          buttons: LinkButton[];
          plan: "gratuit" | "essentiel" | "business";
        }[];
      };
      get_public_lead_magnet: {
        Args: { p_id: string };
        Returns: {
          id: string;
          organization_id: string;
          title: string;
          type: "Checklist" | "Guide PDF" | "Mini-formation";
          org_name: string;
          brand_color: string;
        }[];
      };
      register_link_click: {
        Args: { p_code: string };
        Returns: string | null;
      };
      post_targets_due_for_sync: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["post_targets"]["Row"][];
      };
      conversion_funnel: {
        Args: { p_organization_id: string; p_since: string };
        Returns: { views: number; clicks: number; leads: number; clients: number }[];
      };
      content_performance: {
        Args: { p_organization_id: string; p_since: string };
        Returns: {
          post_id: string;
          title: string;
          views: number;
          clicks: number;
          leads: number;
          clients: number;
        }[];
      };
      leads_by_network: {
        Args: { p_organization_id: string; p_since: string };
        Returns: { network: string; leads: number }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
