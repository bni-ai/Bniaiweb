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
      members: {
        Row: {
          id: string;
          chapter_id: string;
          email: string;
          role: string;
          member_number: string | null;
          chinese_name: string;
          specialty_title: string | null;
          company_name: string | null;
          line_name: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          email: string;
          role?: string;
          member_number?: string | null;
          chinese_name: string;
          specialty_title?: string | null;
          company_name?: string | null;
          line_name?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          email?: string;
          role?: string;
          member_number?: string | null;
          chinese_name?: string;
          specialty_title?: string | null;
          company_name?: string | null;
          line_name?: string | null;
        };
      };
      weekly_briefs: {
        Row: {
          id: string;
          member_id: string;
          week_date: string;
          have_this_week: string | null;
          want_this_week: string | null;
          status: "draft" | "submitted";
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          week_date: string;
          have_this_week?: string | null;
          want_this_week?: string | null;
          status?: "draft" | "submitted";
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          week_date?: string;
          have_this_week?: string | null;
          want_this_week?: string | null;
          status?: "draft" | "submitted";
          submitted_at?: string | null;
        };
      };
      chapter_week_locks: {
        Row: {
          id: string;
          chapter_id: string;
          week_date: string;
          locked_at: string;
          locked_by: string | null;
          reason: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          week_date: string;
          locked_at?: string;
          locked_by?: string | null;
          reason?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          week_date?: string;
          locked_at?: string;
          locked_by?: string | null;
          reason?: string | null;
          created_at?: string | null;
        };
      };
      guests: {
        Row: {
          id: string;
          chapter_id: string;
          name: string;
          company: string | null;
          phone: string | null;
          email: string | null;
          specialty: string | null;
          referrer_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          name: string;
          company?: string | null;
          phone?: string | null;
          email?: string | null;
          specialty?: string | null;
          referrer_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          name?: string;
          company?: string | null;
          phone?: string | null;
          email?: string | null;
          specialty?: string | null;
          referrer_id?: string | null;
          created_at?: string | null;
        };
      };
      guest_visits: {
        Row: {
          id: string;
          guest_id: string;
          week_date: string;
          visit_number: number;
          status: "invited" | "confirmed" | "attended" | "no_show" | "joined_member";
          self_intro: string | null;
          feedback: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          guest_id: string;
          week_date: string;
          visit_number?: number;
          status?: "invited" | "confirmed" | "attended" | "no_show" | "joined_member";
          self_intro?: string | null;
          feedback?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          guest_id?: string;
          week_date?: string;
          visit_number?: number;
          status?: "invited" | "confirmed" | "attended" | "no_show" | "joined_member";
          self_intro?: string | null;
          feedback?: string | null;
          created_at?: string | null;
        };
      };
      guest_content_items: {
        Row: {
          id: string;
          chapter_id: string;
          title: string;
          summary: string | null;
          body: string | null;
          video_url: string | null;
          visibility: "public" | "guest_only";
          status: "draft" | "published";
          published_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          title: string;
          summary?: string | null;
          body?: string | null;
          video_url?: string | null;
          visibility?: "public" | "guest_only";
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          title?: string;
          summary?: string | null;
          body?: string | null;
          video_url?: string | null;
          visibility?: "public" | "guest_only";
          status?: "draft" | "published";
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      presentations: {
        Row: {
          id: string;
          chapter_id: string;
          week_date: string;
          slide_order: Json;
          status: "draft" | "published";
          published_url: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          week_date: string;
          slide_order: Json;
          status?: "draft" | "published";
          published_url?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          week_date?: string;
          slide_order?: Json;
          status?: "draft" | "published";
          published_url?: string | null;
        };
      };
    };
  };
};
