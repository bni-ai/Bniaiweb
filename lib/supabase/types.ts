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
          member_number: string | null;
          chinese_name: string;
          english_name: string | null;
          line_name: string | null;
          specialty_title: string | null;
          specialty_description: string | null;
          general_referral: string | null;
          ideal_referral: string | null;
          dream_referral: string | null;
          company_name: string | null;
          company_address: string | null;
          industry_experience_years: number | null;
          previous_career: string | null;
          gains_goals: string | null;
          gains_accomplishments: string | null;
          gains_interests: string | null;
          gains_networks: string | null;
          gains_skills: string | null;
          photo_url: string | null;
          role: "member" | "officer" | "president" | "pending_member";
          position: string | null;
          committee: string | null;
          is_active: boolean;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          email: string;
          member_number?: string | null;
          chinese_name: string;
          english_name?: string | null;
          line_name?: string | null;
          specialty_title?: string | null;
          specialty_description?: string | null;
          general_referral?: string | null;
          ideal_referral?: string | null;
          dream_referral?: string | null;
          company_name?: string | null;
          company_address?: string | null;
          industry_experience_years?: number | null;
          previous_career?: string | null;
          gains_goals?: string | null;
          gains_accomplishments?: string | null;
          gains_interests?: string | null;
          gains_networks?: string | null;
          gains_skills?: string | null;
          photo_url?: string | null;
          role?: "member" | "officer" | "president" | "pending_member";
          position?: string | null;
          committee?: string | null;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          email?: string;
          member_number?: string | null;
          chinese_name?: string;
          english_name?: string | null;
          line_name?: string | null;
          specialty_title?: string | null;
          specialty_description?: string | null;
          general_referral?: string | null;
          ideal_referral?: string | null;
          dream_referral?: string | null;
          company_name?: string | null;
          company_address?: string | null;
          industry_experience_years?: number | null;
          previous_career?: string | null;
          gains_goals?: string | null;
          gains_accomplishments?: string | null;
          gains_interests?: string | null;
          gains_networks?: string | null;
          gains_skills?: string | null;
          photo_url?: string | null;
          role?: "member" | "officer" | "president" | "pending_member";
          position?: string | null;
          committee?: string | null;
          is_active?: boolean;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      member_top_clients: {
        Row: {
          id: string;
          member_id: string;
          rank: number;
          industry: string;
          company_type: string | null;
          location: string | null;
          notes: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          rank: number;
          industry: string;
          company_type?: string | null;
          location?: string | null;
          notes?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          rank?: number;
          industry?: string;
          company_type?: string | null;
          location?: string | null;
          notes?: string | null;
          updated_at?: string | null;
        };
      };
      member_contacts_circle: {
        Row: {
          id: string;
          member_id: string;
          tier: number;
          name: string;
          relationship: string | null;
          industry: string | null;
          notes: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          tier: number;
          name: string;
          relationship?: string | null;
          industry?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          tier?: number;
          name?: string;
          relationship?: string | null;
          industry?: string | null;
          notes?: string | null;
          created_at?: string | null;
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
      keynote_talks: {
        Row: {
          id: string;
          speaker_id: string;
          week_date: string;
          topic: string;
          outline: string | null;
          product_images: Json | null;
          status: "draft" | "submitted";
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          speaker_id: string;
          week_date: string;
          topic: string;
          outline?: string | null;
          product_images?: Json | null;
          status?: "draft" | "submitted";
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          speaker_id?: string;
          week_date?: string;
          topic?: string;
          outline?: string | null;
          product_images?: Json | null;
          status?: "draft" | "submitted";
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      weekly_awards: {
        Row: {
          id: string;
          chapter_id: string;
          week_date: string;
          recipient_id: string | null;
          award_type: string;
          description: string | null;
          created_by: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          week_date: string;
          recipient_id?: string | null;
          award_type: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          week_date?: string;
          recipient_id?: string | null;
          award_type?: string;
          description?: string | null;
          created_by?: string | null;
          created_at?: string | null;
        };
      };
      weekly_vp_reports: {
        Row: {
          id: string;
          chapter_id: string;
          week_date: string;
          total_referrals: number;
          total_one_on_ones: number;
          total_visitors: number;
          member_attendance: number;
          referral_value_twd: number;
          notes: string | null;
          created_by: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          chapter_id: string;
          week_date: string;
          total_referrals?: number;
          total_one_on_ones?: number;
          total_visitors?: number;
          member_attendance?: number;
          referral_value_twd?: number;
          notes?: string | null;
          created_by?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          chapter_id?: string;
          week_date?: string;
          total_referrals?: number;
          total_one_on_ones?: number;
          total_visitors?: number;
          member_attendance?: number;
          referral_value_twd?: number;
          notes?: string | null;
          created_by?: string | null;
          updated_at?: string | null;
        };
      };
      member_availability: {
        Row: {
          id: string;
          member_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
        };
      };
      one_on_ones: {
        Row: {
          id: string;
          inviter_id: string;
          invitee_id: string;
          scheduled_at: string | null;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          notes: string | null;
          jitsi_room: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          inviter_id: string;
          invitee_id: string;
          scheduled_at?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          notes?: string | null;
          jitsi_room?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          inviter_id?: string;
          invitee_id?: string;
          scheduled_at?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          notes?: string | null;
          jitsi_room?: string | null;
          created_at?: string | null;
        };
      };
      training_records: {
        Row: {
          id: string;
          member_id: string;
          course_id: string;
          completed_at: string;
          credits_earned: number | null;
        };
        Insert: {
          id?: string;
          member_id: string;
          course_id: string;
          completed_at: string;
          credits_earned?: number | null;
        };
        Update: {
          id?: string;
          member_id?: string;
          course_id?: string;
          completed_at?: string;
          credits_earned?: number | null;
        };
      };
    };
  };
};
