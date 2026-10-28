// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — AUDIT ENGINE
// Document Reference: docs/04-TRD.md & GEMINI.md Hard Locks
// ============================================================================

import { HtmlScanResult, ProspectRecord, EmailType } from './types';

/**
 * 21+ Blocklisted directories, lead aggregators, social networks, and national franchises.
 * LOCK 1: Rejects in <150ms before any external paid API calls.
 */
export const BLOCKED_DOMAINS = new Set<string>([
  'yelp.com',
  'angi.com',
  'houzz.com',
  'thumbtack.com',
  'homeadvisor.com',
  'bbb.org',
  'homedepot.com',
  'lowes.com',
  'bathfitter.com',
  'rebath.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'youtube.com',
  'pinterest.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'nextdoor.com',
  'porch.com',
  'buildzoom.com',
  'yellowpages.com',
  'mapquest.com',
  'google.com',
  'yahoo.com',
  'bing.com',
  'angieslist.com',
  'superpages.com',
  'citysearch.com',
  'coloradohomesmag.com',
  'luxesource.com',
  'fabuwood.com',
  'architecturaldigest.com',
  'elledecor.com',
  'housebeautiful.com',
  'realtor.com',
  'zillow.com',
  'redfin.com',
  'trulia.com',
  'homelight.com',
  'forbes.com',
  'thespruce.com',
  'bobvila.com',
  'thisoldhouse.com',
  'hgtv.com',
  'wayfair.com',
  'ikea.com',
  'craftsman.com',
  'ferguson.com',
  'build.com',
  'daltile.com',
  'cambriausa.com',
  'caesarstoneus.com',
  'jameshardie.com',
  'gaf.com',
  'owenscorning.com',
  'certainteed.com',
  'andersenwindows.com',
  'pella.com',
  'marvin.com',
  'kohler.com',
  'moen.com',
  'deltafaucet.com',
]);

/**
 * Normalizes any input URL to its canonical root domain.
 * e.g., "https://www.Houzz.com/professionals/kitchen" -> "houzz.com"
 * e.g., "http://sub.premierkitchensaz.com:8080/index.html?ref=1" -> "premierkitchensaz.com"
 */
export function normalizeRootDomain(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim().toLowerCase();

  // Ensure protocol for URL parsing
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  try {
    const parsed = new URL(cleaned);
    let hostname = parsed.hostname.toLowerCase();

    // Remove leading www. or m.
    hostname = hostname.replace(/^(www\d?|m)\./i, '');

    // For multi-part TLDs or subdomains, extract base domain
    const parts = hostname.split('.');
    if (parts.length > 2) {
      // Handle co.uk, com.au, etc.
      const knownTwoPartTlds = ['co.uk', 'com.au', 'co.nz', 'ca', 'com', 'org', 'net', 'biz', 'us', 'io'];
      const lastTwo = parts.slice(-2).join('.');
      if (knownTwoPartTlds.includes(lastTwo) && parts.length > 2) {
        return parts.slice(-3).join('.');
      }
      return parts.slice(-2).join('.');
    }

    return hostname;
  } catch {
    // Fallback regex if URL constructor fails
    return cleaned
      .replace(/^https?:\/\//i, '')
      .replace(/^(www\d?|m)\./i, '')
      .split('/')[0]
      .split('?')[0]
      .split(':')[0]
      .trim();
  }
}

/**
 * LOCK 1: Directory & Franchise Bouncer First (<150ms)
 * Immediately rejects aggregator and directory sites with zero paid API calls.
 */
export function isBlockedOrDirectory(url: string): { isBlocked: boolean; reason?: string; rootDomain: string } {
  const rootDomain = normalizeRootDomain(url);

  if (!rootDomain) {
    return { isBlocked: true, reason: 'Invalid or empty URL provided.', rootDomain: '' };
  }

  // Anti-SSRF Defense: Block loopback, RFC 1918 private IPs, and cloud metadata endpoints
  const isLocalOrPrivate =
    rootDomain === 'localhost' ||
    rootDomain.endsWith('.local') ||
    rootDomain.endsWith('.internal') ||
    rootDomain.endsWith('.onion') ||
    /^127\.\d+\.\d+\.\d+$/.test(rootDomain) ||
    /^10\.\d+\.\d+\.\d+$/.test(rootDomain) ||
    /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(rootDomain) ||
    /^192\.168\.\d+\.\d+$/.test(rootDomain) ||
    /^169\.254\.\d+\.\d+$/.test(rootDomain) ||
    /^0\.0\.0\.0$/.test(rootDomain) ||
    rootDomain === '::1';

  if (isLocalOrPrivate) {
    return {
      isBlocked: true,
      reason: 'Access to internal, loopback, or private network addresses is forbidden.',
      rootDomain,
    };
  }

  // Media publications, national magazines, review portals, and real estate listings
  if (
    rootDomain.includes('mag.') ||
    rootDomain.endsWith('mag.com') ||
    rootDomain.includes('magazine') ||
    rootDomain.includes('journal') ||
    rootDomain.endsWith('times.com') ||
    rootDomain.includes('realtor') ||
    rootDomain.includes('zillow') ||
    rootDomain.includes('redfin') ||
    rootDomain.includes('patch.com')
  ) {
    return {
      isBlocked: true,
      reason: `${rootDomain} is a media publication or portal, not an independent trade contractor.`,
      rootDomain,
    };
  }
  for (const blocked of BLOCKED_DOMAINS) {
    if (rootDomain === blocked || rootDomain.endsWith(`.${blocked}`)) {
      return {
        isBlocked: true,
        reason: `${rootDomain} is a directory or national franchise — enter an independent contractor domain.`,
        rootDomain,
      };
    }
  }

  return { isBlocked: false, rootDomain };
}

/**
 * Stage 1: DOM Regex Scanner
 * Scans rendered HTML for Ad Pixels, Chat/Voice Widgets, JSON-LD Schema,
 * Cost Calculators, Financing, Before/After Sliders, and Contact details.
 */
export function scanRenderedHtml(html: string): HtmlScanResult {
  if (!html || typeof html !== 'string') {
    return {
      has_google_ads_pixel: false,
      has_meta_pixel: false,
      has_call_tracking: false,
      detected_call_tracker: null,
      detected_crm_or_chat: 'None',
      has_aeo_schema: false,
      has_cost_calculator: false,
      has_financing_widget: false,
      has_before_after_slider: false,
      has_ai_voice_or_chat: false,
      has_service_area_pages: false,
      portfolio_last_updated_year: null,
      website_display_phone: null,
      primary_email: null,
      email_type: 'none',
      instagram_url: null,
      facebook_url: null,
      owner_first_name: null,
      owner_full_name: null,
      specific_project_detail: null,
      unoptimized_images_mb: null,
    };
  }

  // 1. Ad Pixel Signatures
  const has_google_ads_pixel =
    /aw-[0-9]+/i.test(html) ||
    /googleads/i.test(html) ||
    /gtag\(['"]config['"],\s*['"]AW-[0-9]+/i.test(html) ||
    /google_conversion_id/i.test(html);

  const has_meta_pixel =
    /connect\.facebook\.net.*fbevents\.js/i.test(html) ||
    /fbq\(['"]init['"]/i.test(html);

  // 2. Call Tracking Signatures
  let detected_call_tracker: string | null = null;
  const isCallRail = /cdn\.callrail\.com/i.test(html) || /swap\.js/i.test(html);
  const isWhatConverts = /whatconverts/i.test(html);
  const isCallTrackingMetrics = /calltrackingmetrics/i.test(html);

  if (isCallRail) detected_call_tracker = 'CallRail';
  else if (isWhatConverts) detected_call_tracker = 'WhatConverts';
  else if (isCallTrackingMetrics) detected_call_tracker = 'CallTrackingMetrics';

  const has_call_tracking = detected_call_tracker !== null;

  // 3. CRM, Chat & AI Voice Widgets
  let detected_crm_or_chat = 'None';
  let has_ai_voice_or_chat = false;

  if (/leadconnectorhq\.com|msgsndr\.com/i.test(html)) {
    detected_crm_or_chat = 'GoHighLevel';
    has_ai_voice_or_chat = true;
  } else if (/podium\.com\/widget/i.test(html)) {
    detected_crm_or_chat = 'Podium';
    has_ai_voice_or_chat = true;
  } else if (/birdeye\.com/i.test(html)) {
    detected_crm_or_chat = 'Birdeye';
    has_ai_voice_or_chat = true;
  } else if (/vapi\.ai|bland\.ai|retellai/i.test(html)) {
    detected_crm_or_chat = 'AI Voice';
    has_ai_voice_or_chat = true;
  } else if (/drift\.com/i.test(html)) {
    detected_crm_or_chat = 'Drift';
    has_ai_voice_or_chat = true;
  } else if (/intercom\.io|intercomcdn\.com/i.test(html)) {
    detected_crm_or_chat = 'Intercom';
    has_ai_voice_or_chat = true;
  } else if (/tawk\.to/i.test(html)) {
    detected_crm_or_chat = 'Tawk.to';
    has_ai_voice_or_chat = true;
  } else if (/tidio\.co/i.test(html)) {
    detected_crm_or_chat = 'Tidio';
    has_ai_voice_or_chat = true;
  }

  // 4. AEO & Schema Markup
  const has_aeo_schema =
    /application\/ld\+json[\s\S]*?(HomeAndConstructionBusiness|HomeImprovementBusiness|GeneralContractor|FAQPage)/i.test(html);

  // 5. Cost / Budget Calculators
  const has_cost_calculator =
    /(cost|pricing|remodel|budget|estimate)[-_ ]*(calc|calculator|estimator)/i.test(html) ||
    /remodeling-cost-calculator|budget-calculator|instant-estimate/i.test(html);

  // 6. Financing Widgets
  const has_financing_widget =
    /hearth|wisetack|synchrony|greensky|acornfinance|enhancify|financing-options/i.test(html);

  // 7. Draggable Before / After Sliders
  const has_before_after_slider =
    /twentytwenty|juxtapose|beer-slider|before-after-slider|before-after-image-slider|cocoen/i.test(html);

  // 8. Service Area Pages
  const has_service_area_pages =
    /service-areas|areas-we-serve|locations|cities-served|areas-served/i.test(html);

  // 9. Portfolio Year Detection
  let portfolio_last_updated_year: number | null = null;
  const yearMatches = html.match(/(?:201[89]|202[0-6])/g);
  if (yearMatches && yearMatches.length > 0) {
    const years = yearMatches.map(Number).filter((y) => y >= 2018 && y <= 2026);
    if (years.length > 0) {
      portfolio_last_updated_year = Math.max(...years);
    }
  }

  // 10. Display Phone Extraction (Look for tel: href or US phone regex)
  let website_display_phone: string | null = null;
  const telMatch = html.match(/href=["']tel:([^"']+)["']/i);
  if (telMatch && telMatch[1]) {
    website_display_phone = telMatch[1].replace(/[^0-9+()-\s]/g, '').trim();
  } else {
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
    const phoneMatch = html.match(phoneRegex);
    if (phoneMatch) {
      website_display_phone = phoneMatch[0].trim();
    }
  }

  // 11. Email & Email Type Extraction
  let primary_email: string | null = null;
  let email_type: EmailType = 'none';

  const mailtoMatch = html.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
  if (mailtoMatch && mailtoMatch[1]) {
    primary_email = mailtoMatch[1].trim().toLowerCase();
  } else {
    const emailRegex = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g;
    const emails = html.match(emailRegex);
    if (emails) {
      // Filter out common image/code extensions that look like domains
      const valid = emails.filter((e) => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp') && !e.includes('sentry') && !e.includes('wix'));
      if (valid.length > 0) {
        primary_email = valid[0].toLowerCase();
      }
    }
  }

  if (primary_email) {
    const genericPrefixes = ['info@', 'contact@', 'hello@', 'support@', 'admin@', 'sales@', 'office@', 'inquiry@', 'mail@'];
    const isGeneric = genericPrefixes.some((p) => primary_email!.startsWith(p));
    email_type = isGeneric ? 'generic_info' : 'personal';
  }

  // 12. Social Profiles (Instagram & Facebook)
  let instagram_url: string | null = null;
  const igMatch = html.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)\/?/i);
  if (igMatch && !['p', 'reel', 'stories', 'explore'].includes(igMatch[1].toLowerCase())) {
    instagram_url = igMatch[0].replace(/\/+$/, '');
  }

  let facebook_url: string | null = null;
  const fbMatch = html.match(/https?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9_.-]+)\/?/i);
  if (fbMatch && !['sharer', 'share', 'tr', 'dialog'].includes(fbMatch[1].toLowerCase())) {
    facebook_url = fbMatch[0].replace(/\/+$/, '');
  }

  // 13. Owner Name Extraction Heuristics
  let owner_first_name: string | null = null;
  let owner_full_name: string | null = null;

  const ownerPattern = /(?:owner|founder|president|principal|builder|general contractor)[:\s\-–]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i;
  const ownerMatch = html.match(ownerPattern);
  if (ownerMatch && ownerMatch[1]) {
    const candidate = ownerMatch[1].trim();
    if (!candidate.toLowerCase().includes('kitchen') && !candidate.toLowerCase().includes('remodel') && candidate.length < 30) {
      owner_full_name = candidate;
      owner_first_name = candidate.split(' ')[0];
    }
  }

  // 14. Comprehensive Authentic Project Detail & Trade Specialty Extraction
  let specific_project_detail: string | null = null;
  const projectPhrases = [
    // Kitchen & Bath
    /custom\s+(?:white\s+oak|quartzite|marble|walnut|cherry)\s+(?:cabinetry|cabinets|island|countertops|vanities|vanity)/i,
    /(?:modern\s+farmhouse|transitional|coastal|luxury|spa-inspired|scandinavian)\s+(?:kitchen|bathroom|master\s+bath|living)/i,
    /freestanding\s+soaking\s+tub/i,
    /frameless\s+glass\s+(?:walk-in\s+)?shower/i,
    /zero-threshold\s+curbless\s+shower/i,
    /waterfall\s+(?:island|edge|quartz|granite)/i,
    /butler(?:'s)?\s+pantry/i,
    
    // Roofing & Exterior Envelope
    /standing\s+seam\s+(?:metal\s+)?roofing/i,
    /architectural\s+(?:asphalt\s+)?shingles/i,
    /slate\s+(?:and\s+copper\s+)?roofing/i,
    /james\s+hardie\s+(?:fiber\s+cement\s+)?siding/i,
    /energy-efficient\s+(?:triple-pane\s+)?window\s+replacements/i,
    
    // Pools & Outdoor Living
    /custom\s+gunite\s+(?:swimming\s+)?pool/i,
    /infinity(?:-edge)?\s+pool/i,
    /pebble\s+tec\s+pool\s+finish/i,
    /outdoor\s+kitchen\s+(?:and\s+living\s+space|pavilion|pergola|fire\s+pit)/i,
    /travertine\s+(?:paver\s+)?pool\s+deck/i,
    /custom\s+cedar\s+(?:and\s+composite\s+)?pergola/i,
    
    // Structural & Additions
    /second-story\s+home\s+addition/i,
    /custom\s+accessory\s+dwelling\s+unit\s*\(ADU\)/i,
    /timber\s+frame\s+(?:construction|pavilion)/i,
    /structural\s+beam\s+and\s+load-bearing\s+wall\s+removal/i,
    
    // HVAC, Mechanical & Electrical
    /geothermal\s+heat\s+pump\s+system/i,
    /multi-zone\s+ductless\s+mini-split/i,
    /whole-home\s+standby\s+generator/i,
    /closed-cell\s+spray\s+foam\s+insulation/i,
    
    // Flooring & Masonry
    /wide\s+plank\s+(?:european\s+white\s+oak|engineered)\s+hardwood/i,
    /herringbone\s+wood\s+flooring/i,
    /natural\s+dry-stack\s+stone\s+masonry/i,
    /decorative\s+stamped\s+concrete\s+patio/i
  ];

  for (const regex of projectPhrases) {
    const m = html.match(regex);
    if (m) {
      specific_project_detail = m[0].trim();
      break;
    }
  }

  // Fallback 1: Extract prominent <h1> heading if it mentions real services
  if (!specific_project_detail) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
      const cleanH1 = h1Match[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      if (cleanH1.length >= 10 && cleanH1.length <= 70 && !/welcome|home|about/i.test(cleanH1)) {
        specific_project_detail = cleanH1;
      }
    }
  }

  // Fallback 2: Extract clean <title> if informative
  if (!specific_project_detail) {
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      const cleanTitle = titleMatch[1].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
      const servicePart = cleanTitle.split(/[-|–•]/)[0]?.trim();
      if (servicePart && servicePart.length >= 10 && servicePart.length <= 60) {
        specific_project_detail = servicePart;
      }
    }
  }

  // Estimate unoptimized image payload (mb) roughly from img tags count if not from PageSpeed
  const imgMatches = html.match(/<img[^>]+>/gi);
  const unoptimized_images_mb = imgMatches && imgMatches.length > 15 ? Number((imgMatches.length * 0.45).toFixed(2)) : 1.2;

  return {
    has_google_ads_pixel,
    has_meta_pixel,
    has_call_tracking,
    detected_call_tracker,
    detected_crm_or_chat,
    has_aeo_schema,
    has_cost_calculator,
    has_financing_widget,
    has_before_after_slider,
    has_ai_voice_or_chat,
    has_service_area_pages,
    portfolio_last_updated_year,
    website_display_phone,
    primary_email,
    email_type,
    instagram_url,
    facebook_url,
    owner_first_name,
    owner_full_name,
    specific_project_detail,
    unoptimized_images_mb,
  };
}

/**
 * Deterministic Cash-Burn Leak Score Formula (0–100)
 * Specification Reference: docs/04-TRD.md Section 3
 */
export function calculateLeakScore(p: Partial<ProspectRecord>): number {
  let score = 0;

  // 1. Money-in-Motion Signals (Max 45 pts)
  if (p.is_running_google_lsa || p.is_running_google_ppc) {
    score += 30;
  } else if (p.has_google_ads_pixel || p.has_meta_pixel) {
    score += 20;
  }
  if (p.has_call_tracking) {
    score += 15;
  }

  // 2. Funnel & Operational Bleed Signals (Max 55 pts)
  if (!p.has_ai_voice_or_chat) {
    score += 20;
  }
  if (!p.has_cost_calculator) {
    score += 15;
  }
  if ((p.mobile_speed_score ?? 50) < 60) {
    score += 10;
  }
  if (!p.has_aeo_schema) {
    score += 5;
  }
  if ((p.days_since_last_review ?? 0) > 90) {
    score += 5;
  }

  // 3. Live Phone Test Bonus (+15 pts if tested & leaked)
  if (p.missed_call_tested && p.missed_call_leaked) {
    score += 15;
  }

  // 4. Competitor Lock Penalty (-60 pts if already fully modernized)
  if (p.has_ai_voice_or_chat && (p.mobile_speed_score ?? 0) >= 75 && p.has_cost_calculator) {
    score -= 60;
  }

  return Math.max(0, Math.min(100, score));
}
