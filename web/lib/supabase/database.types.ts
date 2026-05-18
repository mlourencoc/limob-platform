// lib/supabase/database.types.ts
// Gerado via: npx supabase gen types typescript --local > lib/supabase/database.types.ts
// Regenerar sempre que o schema mudar.
//
// ATEN�?�fO: não editar manualmente �?" manter sincronizado com o banco.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      brokers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          creci: string | null;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          creci?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          creci?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      developments: {
        Row: {
          id: string;
          name: string;
          builder: string | null;
          city: string | null;
          neighborhood: string | null;
          address: string | null;
          is_active: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          builder?: string | null;
          city?: string | null;
          neighborhood?: string | null;
          address?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          builder?: string | null;
          city?: string | null;
          neighborhood?: string | null;
          address?: string | null;
          is_active?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      imports: {
        Row: {
          id: string;
          filename: string;
          status: Database['public']['Enums']['import_status'];
          total_rows: number | null;
          processed_rows: number | null;
          created_rows: number | null;
          updated_rows: number | null;
          stale_rows: number | null;
          error_message: string | null;
          raw_headers: string[] | null;
          column_mapping: Json | null;
          imported_by: string | null;
          metadata: Json | null;
          created_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          filename: string;
          status?: Database['public']['Enums']['import_status'];
          total_rows?: number | null;
          processed_rows?: number | null;
          created_rows?: number | null;
          updated_rows?: number | null;
          stale_rows?: number | null;
          error_message?: string | null;
          raw_headers?: string[] | null;
          column_mapping?: Json | null;
          imported_by?: string | null;
          metadata?: Json | null;
          created_at?: string;
          finished_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['imports']['Insert']>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          type: Database['public']['Enums']['property_type'];
          subtype: Database['public']['Enums']['property_subtype'] | null;
          city: string;
          neighborhood: string | null;
          address: string | null;
          development_id: string | null;
          broker_id: string | null;
          unit: string | null;
          builder: string | null;
          area_m2: number | null;
          bedrooms: number | null;
          suites: number | null;
          parking_spots: number | null;
          storage_unit: boolean;
          price: number | null;
          condo_fee: number | null;
          state: Database['public']['Enums']['property_state'] | null;
          situation: Database['public']['Enums']['property_situation'] | null;
          commercial_status: Database['public']['Enums']['commercial_status'];
          delivery_status: Database['public']['Enums']['delivery_status'] | null;
          delivery_year: number | null;
          description: string | null;
          highlights: string[];
          import_id: string | null;
          external_ref: string | null;
          is_stale: boolean;
          stale_since: string | null;
          deleted_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: Database['public']['Enums']['property_type'];
          subtype?: Database['public']['Enums']['property_subtype'] | null;
          city: string;
          neighborhood?: string | null;
          address?: string | null;
          development_id?: string | null;
          broker_id?: string | null;
          unit?: string | null;
          builder?: string | null;
          area_m2?: number | null;
          bedrooms?: number | null;
          suites?: number | null;
          parking_spots?: number | null;
          storage_unit?: boolean;
          price?: number | null;
          condo_fee?: number | null;
          state?: Database['public']['Enums']['property_state'] | null;
          situation?: Database['public']['Enums']['property_situation'] | null;
          commercial_status?: Database['public']['Enums']['commercial_status'];
          delivery_status?: Database['public']['Enums']['delivery_status'] | null;
          delivery_year?: number | null;
          description?: string | null;
          highlights?: string[];
          import_id?: string | null;
          external_ref?: string | null;
          is_stale?: boolean;
          stale_since?: string | null;
          deleted_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['properties']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'properties_broker_id_fkey';
            columns: ['broker_id'];
            referencedRelation: 'brokers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_development_id_fkey';
            columns: ['development_id'];
            referencedRelation: 'developments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'properties_import_id_fkey';
            columns: ['import_id'];
            referencedRelation: 'imports';
            referencedColumns: ['id'];
          },
        ];
      };
      property_links: {
        Row: {
          id: string;
          property_id: string;
          type: Database['public']['Enums']['link_type'];
          url: string;
          label: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          property_id: string;
          type: Database['public']['Enums']['link_type'];
          url: string;
          label?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['property_links']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'property_links_property_id_fkey';
            columns: ['property_id'];
            referencedRelation: 'properties';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      v_properties_enriched: {
        Row: Database['public']['Tables']['properties']['Row'] & {
          property_age_years: number | null;
          broker_name: string | null;
          broker_email: string | null;
          broker_creci: string | null;
          development_name: string | null;
          development_builder: string | null;
          links_count: number;
        };
        Relationships: Database['public']['Tables']['properties']['Relationships'];
      };
    };
    Functions: Record<string, never>;
    Enums: {
      property_type: 'apartamento' | 'casa' | 'terreno' | 'comercial' | 'rural' | 'outro';
      property_subtype:
        | 'padrao'
        | 'cobertura'
        | 'duplex'
        | 'triplex'
        | 'studio'
        | 'kitnet'
        | 'flat'
        | 'sobrado'
        | 'condominio_fechado'
        | 'outro';
      property_state: 'novo' | 'seminovo' | 'usado';
      property_situation: 'na_planta' | 'em_construcao' | 'pronto';
      commercial_status: 'disponivel' | 'reservado' | 'vendido' | 'locado' | 'inativo';
      delivery_status: 'futuro' | 'em_obra' | 'entregue';
      import_status: 'pendente' | 'processando' | 'concluido' | 'erro';
      link_type: 'drive_fotos' | 'drive_documentos' | 'localizacao' | 'tour_virtual' | 'outro';
    };
    CompositeTypes: Record<string, never>;
  };
};

// Helpers de conveniência
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Views<T extends keyof Database['public']['Views']> =
  Database['public']['Views'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
