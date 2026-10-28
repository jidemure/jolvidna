# 04 - Technical Requirements Document (`04-TRD.md`)

**Document ID:** `04-TRD.md`  
**Builds On:** `01-PRD.md`, `02-App-Flow.md`, `03-Schema.md`  
**Purpose:** Specifies exact API routes, environment variables, regex detection matrices, scoring math, external API payloads, and LLM JSON contracts.

---

## 1. Environment Variables Contract (`.env.local`)

```ini
# Supabase Connection
NEXT_PUBLIC_SUPABASE_URL="[https://your-project.supabase.co](https://your-project.supabase.co)"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Scraping & Performance APIs
SCRAPINGBEE_API_KEY="spb_..."
GOOGLE_PAGESPEED_API_KEY="AIza..."
APIFY_API_TOKEN="apify_api_..."

# Cloudinary Visual Proof Engine
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="your_secret"

# LLM Agent (Gemini 2.5 Pro / OpenAI / Anthropic via Gravity 2.0)
LLM_API_KEY="AIza..."

```

---

## 2. DOM Regex Signature Matrix (`src/lib/auditEngine.ts`)

Every scraped HTML payload from ScrapingBee (`render_js=true`) MUST be scanned against these exact regular expressions:

| Signal Field | Regex Pattern |
| --- | --- |
| `has_google_ads_pixel` | `/aw-[0-9]+ |
| `has_meta_pixel` | `/connect.facebook.net.*fbevents.js |
| `has_call_tracking` | `/swap.js |
| `detected_crm_or_chat` (GHL) | `/leadconnectorhq.com |
| `detected_crm_or_chat` (Podium/Birdeye) | `/podium.com/widget |
| `detected_crm_or_chat` (AI Voice) | `/vapi.ai |
| `has_aeo_schema` | `/application/ld+json[\s\S]*?(HomeAndConstructionBusiness |
| `has_cost_calculator` | `/(cost |
| `has_financing_widget` | `/hearth |
| `has_before_after_slider` | `/twentytwenty |

---

## 3. Deterministic Cash-Burn Leak Score Formula (`0–100`)

```typescript
export function calculateLeakScore(p: Partial<ProspectRecord>): number {
  let score = 0;

  // 1. Money-in-Motion Signals (Max 45 pts)
  if (p.is_running_google_lsa || p.is_running_google_ppc) score += 30;
  else if (p.has_google_ads_pixel || p.has_meta_pixel) score += 20;
  if (p.has_call_tracking) score += 15;

  // 2. Funnel & Operational Bleed Signals (Max 55 pts)
  if (!p.has_ai_voice_or_chat) score += 20;
  if (!p.has_cost_calculator) score += 15;
  if ((p.mobile_speed_score ?? 50) < 60) score += 10;
  if (!p.has_aeo_schema) score += 5;
  if ((p.days_since_last_review ?? 0) > 90) score += 5;

  // 3. Live Phone Test Bonus (+15 pts if tested & leaked)
  if (p.missed_call_tested && p.missed_call_leaked) score += 15;

  // 4. Competitor Lock Penalty (-60 pts if already fully modernized)
  if (p.has_ai_voice_or_chat && (p.mobile_speed_score ?? 0) >= 75 && p.has_cost_calculator) {
    score -= 60;
  }

  return Math.max(0, Math.min(100, score));
}

```

---

## 4. API Route Specifications

### 4.1 `POST /api/audit/single`

* **Request Body:**
```json
{
  "url": "[https://elitekitchenstx.com](https://elitekitchenstx.com)",
  "ad_landing_page_url": null,
  "city": "Plano, TX",
  "is_running_google_ppc": true,
  "is_running_google_lsa": false,
  "force_refresh": false
}

```


* **Execution Steps:**
1. Normalize `root_domain`. Reject if in `BLOCKED_DOMAINS`.
2. Query `prospects` by `root_domain`. If found and `<30 days` old and `!force_refresh`, return cached record + pitch (`status: 200`).
3. Execute `Promise.allSettled([scrapingBeeMobileRender, pageSpeedMobileCheck, googlePlacesLookup])`.
4. Run `scanRenderedHtml(html)`.
5. If `owner_first_name == null` or (`instagram_url == null` and `primary_email == null`), execute Layer 2 ScrapingBee Google SERP fallback query.
6. Upload mobile screenshot to Cloudinary and transform into `cloudinary_annotated_mockup_url`.
7. Calculate `leak_score` and invoke LLM Pitch Generator (`pitchAgent.ts`).
8. Upsert into `public.prospects` and `public.pitches`. Return combined JSON.



### 4.2 `POST /api/radar/launch`

* **Request Body:**
```json
{
  "niche": "Kitchen Remodeler",
  "target_city": "Plano, TX",
  "target_timezone": "America/Chicago"
}

```


* **Execution Steps:**
1. Verify `isTargetCityInPeakAdHours(target_timezone)`.
2. If `false`, insert row into `radar_campaigns` with `status = 'queued'` and `scheduled_for` next 09:30 local window.
3. If `true`, scrape Google SERP via ScrapingBee, filter out `BLOCKED_DOMAINS` and existing `root_domain` rows, and process up to 15 clean contractor domains in batches of 3 through the audit pipeline.



### 4.3 `PATCH /api/prospects/[id]/call-test`

* **Request Body:** `{ "missed_call_leaked": true }`
* **Execution Steps:** Updates `missed_call_tested = true`, `missed_call_leaked`, recalculates `leak_score`, re-runs `pitchAgent.ts` prioritizing the **30-Second AI Voice Callback + SMS Text-Back** angle, and updates `public.pitches`.

---

## 5. LLM Pitch Generator System Prompt & JSON Schema (`src/lib/pitchAgent.ts`)

* **Response MIME Type:** `application/json`
* **Mandatory Constraints:**
1. `specific_project_detail`: Must cite a real project, wood/stone material, neighborhood, or headline from the scraped text. Never invent facts.
2. `top_two_leaks`: Array of exactly 2 strings representing the highest-cost problems found.
3. `email_body`: Strictly `< 110 words`. Must embed `{{CLOUDINARY_MOCKUP_URL}}` and speak in contractor ROI terms (*"$5k budget tire-kickers"*, *"missing calls on a loud job site"*, *"burning $50/click on Google Ads"*).
4. `social_dm_body`: Strictly `< 45 words`. Zero URLs/links. Conversational compliment + 1 binary question.
