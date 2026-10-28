// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — SHARED TYPES & CONTRACTS
// Document References: docs/03-Schema.md & docs/04-TRD.md
// ============================================================================

export type CampaignStatus = 'queued' | 'running_serp' | 'auditing' | 'completed' | 'failed';

export type OutreachStatus = 'audited' | 'pitched_email' | 'pitched_dm' | 'followup_due' | 'replied' | 'archived';

export type EmailType = 'personal' | 'generic_info' | 'none';

export type RecommendedChannel = 'email' | 'social_dm';

export interface RadarCampaignRecord {
  id: string;
  niche: string;
  target_city: string;
  target_timezone: string;
  status: CampaignStatus;
  total_domains_found: number;
  blocked_or_duplicate_count: number;
  qualified_leads_count: number;
  scheduled_for: string | null;
  started_at: string | null;
  completed_at: string | null;
  error_log: string | null;
  created_at: string;
}

export interface ProspectRecord {
  id: string;
  campaign_id: string | null;

  // Core Identity & Deduplication Lock
  business_name: string;
  root_domain: string;
  homepage_url: string;
  ad_landing_page_url: string | null;
  city: string | null;

  // Stage 2: Contact & Social Fallback Waterfall
  owner_first_name: string | null;
  owner_full_name: string | null;
  primary_email: string | null;
  email_type: EmailType;
  gbp_primary_phone: string | null;
  website_display_phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  recommended_channel: RecommendedChannel;

  // Stage 0 & 1: Ad-Spend Signals (Money-in-Motion)
  is_running_google_lsa: boolean;
  is_running_google_ppc: boolean;
  has_google_ads_pixel: boolean;
  has_meta_pixel: boolean;
  has_call_tracking: boolean;
  detected_call_tracker: string | null;
  organic_serp_rank: number | null;

  // Stage 1: 14-Point Technical & Funnel Audit
  mobile_speed_score: number | null;
  mobile_lcp_seconds: number | null;
  unoptimized_images_mb: number | null;
  has_aeo_schema: boolean;
  has_service_area_pages: boolean;
  has_ai_voice_or_chat: boolean;
  detected_crm_or_chat: string;
  has_cost_calculator: boolean;
  has_financing_widget: boolean;
  has_before_after_slider: boolean;
  portfolio_last_updated_year: number | null;

  // Google Business Profile & Live Call Leak Test
  gbp_rating: number | null;
  gbp_review_count: number | null;
  days_since_last_review: number | null;
  missed_call_tested: boolean;
  missed_call_leaked: boolean;

  // Extracted Proof & Cloudinary Visual Assets
  specific_project_detail: string | null;
  cloudinary_raw_mobile_url: string | null;
  cloudinary_annotated_mockup_url: string | null;
  cloudinary_raw_desktop_url?: string | null;
  cloudinary_annotated_desktop_url?: string | null;

  // Scoring & Outreach Lifecycle
  leak_score: number;
  outreach_status: OutreachStatus;
  pitched_at: string | null;
  last_audited_at: string;
  created_at: string;
  updated_at: string;
}

export interface PitchRecord {
  id: string;
  prospect_id: string;
  top_two_leaks: string[];
  email_subject: string;
  email_body: string;
  email_word_count: number | null;
  social_dm_body: string;
  social_dm_word_count: number | null;
  followup_day3_body: string;
  email_followup_day3?: string | null;
  email_followup_day7?: string | null;
  email_followup_day14?: string | null;
  social_followup_day3?: string | null;
  social_followup_day7?: string | null;
  generated_with_call_leak: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProspectWithPitch extends ProspectRecord {
  pitch?: PitchRecord | null;
}

export interface HtmlScanResult {
  has_google_ads_pixel: boolean;
  has_meta_pixel: boolean;
  has_call_tracking: boolean;
  detected_call_tracker: string | null;
  detected_crm_or_chat: string;
  has_aeo_schema: boolean;
  has_cost_calculator: boolean;
  has_financing_widget: boolean;
  has_before_after_slider: boolean;
  has_ai_voice_or_chat: boolean;
  has_service_area_pages: boolean;
  portfolio_last_updated_year: number | null;
  website_display_phone: string | null;
  primary_email: string | null;
  email_type: EmailType;
  instagram_url: string | null;
  facebook_url: string | null;
  owner_first_name: string | null;
  owner_full_name: string | null;
  specific_project_detail: string | null;
  unoptimized_images_mb: number | null;
}

export interface PageSpeedResult {
  mobile_speed_score: number;
  mobile_lcp_seconds: number;
  unoptimized_images_mb?: number;
}

export interface GooglePlacesResult {
  gbp_rating: number | null;
  gbp_review_count: number | null;
  days_since_last_review: number | null;
  gbp_primary_phone: string | null;
  business_name?: string | null;
  city?: string | null;
}

export interface GeneratedPitchContent {
  specific_project_detail: string;
  top_two_leaks: [string, string];
  email_subject: string;
  email_body: string;
  email_word_count: number;
  social_dm_body: string;
  social_dm_word_count: number;
  followup_day3_body: string;
  email_followup_day3?: string;
  email_followup_day7?: string;
  email_followup_day14?: string;
  social_followup_day3?: string;
  social_followup_day7?: string;
}

export interface AuditSingleRequest {
  url: string;
  ad_landing_page_url?: string | null;
  city?: string | null;
  is_running_google_ppc?: boolean;
  is_running_google_lsa?: boolean;
  force_refresh?: boolean;
}

export interface AuditSingleResponse {
  success: boolean;
  cached: boolean;
  message?: string;
  prospect: ProspectRecord;
  pitch: PitchRecord | null;
}

export interface RadarLaunchRequest {
  niche: string;
  target_city: string;
  target_timezone: string;
  force_run_now?: boolean;
}

export interface CallTestRequest {
  missed_call_leaked: boolean;
}

export interface StatusUpdateRequest {
  outreach_status: OutreachStatus;
}
