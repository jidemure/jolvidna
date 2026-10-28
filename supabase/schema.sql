-- ============================================================================
-- OPPORTUNITY RADAR & PITCH ENGINE — SUPABASE DATABASE SCHEMA
-- Document Reference: docs/03-Schema.md
-- Target: Supabase PostgreSQL 15+
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- TABLE 1: RADAR CAMPAIGNS (Stage 0 Automated Discovery Jobs)
-- ============================================================================
create table if not exists public.radar_campaigns (
  id uuid primary key default uuid_generate_v4(),
  niche text not null,                        -- e.g., 'Kitchen Remodeler'
  target_city text not null,                  -- e.g., 'Plano, TX'
  target_timezone text not null,              -- e.g., 'America/Chicago'
  status text not null default 'queued'
    check (status in ('queued', 'running_serp', 'auditing', 'completed', 'failed')),
  total_domains_found int not null default 0,
  blocked_or_duplicate_count int not null default 0,
  qualified_leads_count int not null default 0,
  scheduled_for timestamptz,                  -- Target city peak window (09:00-16:59 local)
  started_at timestamptz,
  completed_at timestamptz,
  error_log text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- TABLE 2: PROSPECTS (Stages 1 & 2 Master Deduplicated Audit Record)
-- ============================================================================
create table if not exists public.prospects (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references public.radar_campaigns(id) on delete set null,

  -- Core Identity & Deduplication Lock
  business_name text not null,
  root_domain text unique not null,           -- Normalized (e.g., 'elitekitchens.com')
  homepage_url text not null,
  ad_landing_page_url text,                   -- Specific PPC destination URL if different
  city text,

  -- Stage 2: Contact & Social Fallback Waterfall
  owner_first_name text,
  owner_full_name text,
  primary_email text,
  email_type text not null default 'none'
    check (email_type in ('personal', 'generic_info', 'none')),
  gbp_primary_phone text,                     -- Direct phone from Google Maps (bypasses CallRail)
  website_display_phone text,                 -- Phone scraped from website DOM
  instagram_url text,
  facebook_url text,
  recommended_channel text not null default 'email'
    check (recommended_channel in ('email', 'social_dm')),

  -- Stage 0 & 1: Ad-Spend Signals (Money-in-Motion)
  is_running_google_lsa boolean not null default false,
  is_running_google_ppc boolean not null default false,
  has_google_ads_pixel boolean not null default false,
  has_meta_pixel boolean not null default false,
  has_call_tracking boolean not null default false,
  detected_call_tracker text,                 -- 'CallRail', 'WhatConverts', etc.
  organic_serp_rank int,                      -- e.g., 9 to 25

  -- Stage 1: 14-Point Technical & Funnel Audit
  mobile_speed_score int,                     -- 0 to 100 (Google PageSpeed Mobile)
  mobile_lcp_seconds numeric(4,1),            -- e.g., 7.8s
  unoptimized_images_mb numeric(5,2),         -- e.g., 12.40 MB
  has_aeo_schema boolean not null default false,
  has_service_area_pages boolean not null default false,
  has_ai_voice_or_chat boolean not null default false,
  detected_crm_or_chat text not null default 'None',
  has_cost_calculator boolean not null default false,
  has_financing_widget boolean not null default false,
  has_before_after_slider boolean not null default false,
  portfolio_last_updated_year int,

  -- Google Business Profile & Live Call Leak Test
  gbp_rating numeric(2,1),
  gbp_review_count int,
  days_since_last_review int,
  missed_call_tested boolean not null default false,
  missed_call_leaked boolean not null default false,

  -- Extracted Proof & Cloudinary Visual Assets
  specific_project_detail text,               -- Authentic scraped detail for pitch opener
  cloudinary_raw_mobile_url text,
  cloudinary_annotated_mockup_url text,
  cloudinary_raw_desktop_url text,
  cloudinary_annotated_desktop_url text,

  -- Scoring & Outreach Lifecycle
  leak_score int not null default 0
    check (leak_score >= 0 and leak_score <= 100),
  outreach_status text not null default 'audited'
    check (outreach_status in ('audited', 'pitched_email', 'pitched_dm', 'followup_due', 'replied', 'archived')),
  pitched_at timestamptz,
  last_audited_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- TABLE 3: PITCHES (Stage 3 Hyper-Custom Generated Scripts)
-- ============================================================================
create table if not exists public.pitches (
  id uuid primary key default uuid_generate_v4(),
  prospect_id uuid not null unique references public.prospects(id) on delete cascade,
  top_two_leaks text[] not null default '{}',
  email_subject text not null,
  email_body text not null,
  email_word_count int,
  social_dm_body text not null,
  social_dm_word_count int,
  followup_day3_body text not null,
  generated_with_call_leak boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES FOR SUB-50MS DASHBOARD QUERIES
-- ============================================================================
create index if not exists idx_prospects_leak_score on public.prospects (leak_score desc);
create index if not exists idx_prospects_outreach_status on public.prospects (outreach_status);
create index if not exists idx_prospects_root_domain on public.prospects (root_domain);
create index if not exists idx_campaigns_status_sched on public.radar_campaigns (status, scheduled_for);

-- ============================================================================
-- AUTOMATIC `updated_at` TRIGGER
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_prospects_updated_at
before update on public.prospects
for each row execute function public.set_updated_at();

create trigger trg_pitches_updated_at
before update on public.pitches
for each row execute function public.set_updated_at();

-- ============================================================================
-- HELPER FUNCTION: AUTO-MARK 72-HOUR STALE PITCHES AS `followup_due`
-- ============================================================================
create or replace function public.refresh_due_followups()
returns int as $$
declare
  updated_rows int;
begin
  update public.prospects
  set outreach_status = 'followup_due'
  where outreach_status in ('pitched_email', 'pitched_dm')
    and pitched_at <= (now() - interval '72 hours');
  get diagnostics updated_rows = row_count;
  return updated_rows;
end;
$$ language plpgsql;


-- ============================================================================
-- ROW LEVEL SECURITY (RLS) LOCKDOWN
-- Prevents unauthenticated browser access via Supabase public URL / anon key.
-- Server-side Next.js routes use SUPABASE_SERVICE_ROLE_KEY to bypass RLS securely.
-- ============================================================================
alter table public.radar_campaigns enable row level security;
alter table public.prospects enable row level security;
alter table public.pitches enable row level security;
