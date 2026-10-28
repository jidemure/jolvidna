// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — VISUAL PROOF & SCRAPING ENGINE
// Document Reference: docs/04-TRD.md & GEMINI.md Hard Locks 5 & 6
// ============================================================================

import { v2 as cloudinary } from 'cloudinary';
import { PageSpeedResult, GooglePlacesResult } from './types';

// Configure Cloudinary once if credentials exist
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Executes a fetch request with a strict timeout circuit breaker (LOCK 6).
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err: unknown) {
    clearTimeout(id);
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Request to ${url.slice(0, 50)}... timed out or failed after ${timeoutMs}ms: ${message}`);
  }
}

/**
 * Scrapes mobile DOM (390x844) and captures screenshot via ScrapingBee.
 * With `json_response=true` and `screenshot=true`, ScrapingBee returns both
 * rendered HTML and base64 screenshot in a single credit-conserving call.
 */
export async function scrapeAndCaptureMobile(targetUrl: string): Promise<{
  html: string;
  base64Screenshot: string | null;
}> {
  const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!scrapingBeeApiKey || scrapingBeeApiKey.startsWith('spb_demo') || scrapingBeeApiKey.includes('...')) {
    // Graceful fallback for mock/local test when key not configured
    return {
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Premier Kitchens & Bathrooms</title>
            <script src="https://connect.facebook.net/en_US/fbevents.js"></script>
            <script>fbq('init', '123456789');</script>
            <script src="https://www.googletagmanager.com/gtag/js?id=AW-987654321"></script>
            <script src="//cdn.callrail.com/companies/123/swap.js"></script>
          </head>
          <body>
            <h1>Luxury Kitchen & Master Bath Remodeling in Scottsdale</h1>
            <p>Owned and founded by David Miller. We specialize in custom white oak cabinetry and quartzite waterfall islands.</p>
            <a href="tel:(480) 555-0199">(480) 555-0199</a>
            <a href="mailto:david@premierkitchensaz.com">david@premierkitchensaz.com</a>
            <a href="https://instagram.com/premierkitchensaz">Instagram</a>
          </body>
        </html>
      `,
      base64Screenshot: null,
    };
  }

  const endpoint = new URL('https://app.scrapingbee.com/api/v1/');
  endpoint.searchParams.set('api_key', scrapingBeeApiKey);
  endpoint.searchParams.set('url', targetUrl);
  endpoint.searchParams.set('render_js', 'true');
  endpoint.searchParams.set('device', 'mobile');
  endpoint.searchParams.set('window_width', '390');
  endpoint.searchParams.set('window_height', '844');
  endpoint.searchParams.set('screenshot', 'true');
  endpoint.searchParams.set('json_response', 'true');

  try {
    const res = await fetchWithTimeout(endpoint.toString(), {}, 8000);
    if (!res.ok) {
      throw new Error(`ScrapingBee responded with status ${res.status}`);
    }
    const data = (await res.json()) as { body?: string; screenshot?: string };
    return {
      html: data.body || '',
      base64Screenshot: data.screenshot || null,
    };
  } catch (error) {
    console.warn(`ScrapingBee call failed for ${targetUrl}:`, error);
    // Return empty fallback so rest of pipeline can continue
    return { html: '', base64Screenshot: null };
  }
}

/**
 * Captures true desktop DOM (1440x900) screenshot via ScrapingBee with desktop user-agent.
 */
export async function captureDesktopScreenshot(targetUrl: string): Promise<string | null> {
  const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!scrapingBeeApiKey || scrapingBeeApiKey.startsWith('spb_demo') || scrapingBeeApiKey.includes('...')) {
    return null;
  }

  const endpoint = new URL('https://app.scrapingbee.com/api/v1/');
  endpoint.searchParams.set('api_key', scrapingBeeApiKey);
  endpoint.searchParams.set('url', targetUrl);
  endpoint.searchParams.set('render_js', 'true');
  endpoint.searchParams.set('device', 'desktop');
  endpoint.searchParams.set('window_width', '1440');
  endpoint.searchParams.set('window_height', '900');
  endpoint.searchParams.set('screenshot', 'true');
  endpoint.searchParams.set('json_response', 'true');

  try {
    const res = await fetchWithTimeout(endpoint.toString(), {}, 8000);
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as { screenshot?: string };
    return data.screenshot || null;
  } catch (error) {
    console.warn(`ScrapingBee desktop screenshot failed for ${targetUrl}:`, error);
    return null;
  }
}

interface PageSpeedApiResponse {
  lighthouseResult?: {
    categories?: {
      performance?: {
        score?: number;
      };
    };
    audits?: {
      'largest-contentful-paint'?: {
        numericValue?: number;
      };
      'uses-optimized-images'?: {
        details?: {
          overallSavingsBytes?: number;
        };
      };
    };
  };
}



/**
 * Checks Google PageSpeed Mobile Insights with 8,000ms circuit breaker.
 * LOCK 6: If times out, falls back to mobile_speed_score = 38, mobile_lcp_seconds = 8.5.
 */
export async function checkMobilePageSpeed(targetUrl: string): Promise<PageSpeedResult> {
  const fallbackResult: PageSpeedResult = {
    mobile_speed_score: 38,
    mobile_lcp_seconds: 8.5,
    unoptimized_images_mb: 5.4,
  };

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey || apiKey.includes('...')) {
    return fallbackResult;
  }

  const endpoint = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url', targetUrl);
  endpoint.searchParams.set('strategy', 'mobile');
  endpoint.searchParams.set('category', 'performance');
  endpoint.searchParams.set('key', apiKey);

  try {
    const res = await fetchWithTimeout(endpoint.toString(), {}, 8000);
    if (!res.ok) {
      return fallbackResult;
    }
    const json = (await res.json()) as PageSpeedApiResponse;
    const score = Math.round((json?.lighthouseResult?.categories?.performance?.score ?? 0.38) * 100);
    const lcpAudit = json?.lighthouseResult?.audits?.['largest-contentful-paint'];
    const lcpSec = lcpAudit?.numericValue ? Number((lcpAudit.numericValue / 1000).toFixed(1)) : 8.5;

    // Estimate unoptimized images savings in MB
    const imageSavingsBytes = json?.lighthouseResult?.audits?.['uses-optimized-images']?.details?.overallSavingsBytes ?? 0;
    const imageMb = Number((imageSavingsBytes / (1024 * 1024)).toFixed(2));

    return {
      mobile_speed_score: score,
      mobile_lcp_seconds: lcpSec,
      unoptimized_images_mb: imageMb > 0 ? imageMb : 4.8,
    };
  } catch (err) {
    console.warn(`PageSpeed check timed out or failed for ${targetUrl}. Applying LOCK 6 fallback.`, err);
    return fallbackResult;
  }
}

/**
 * Performs Google Places & Maps contractor profile lookup exclusively via Apify (compass~crawler-google-places).
 * Extracts verified phone number, rating, review count, and review recency.
 */
export async function lookupGooglePlaces(businessName: string, city: string = ''): Promise<GooglePlacesResult> {
  const fallbackResult: GooglePlacesResult = {
    gbp_rating: 4.8,
    gbp_review_count: 32,
    days_since_last_review: 114,
    gbp_primary_phone: null,
  };

  const apifyToken = process.env.APIFY_API_TOKEN || process.env.APIFY_TOKEN;

  if (!apifyToken || apifyToken.includes('...')) {
    return fallbackResult;
  }

  try {
    const apifyUrl = `https://api.apify.com/v2/acts/compass~crawler-google-places/run-sync-get-dataset-items?token=${apifyToken}&timeout=10`;
    const payload = {
      searchStringsArray: [`${businessName} ${city}`.trim()],
      maxCrawledPlacesPerSearch: 1,
      language: 'en',
      skipClosedPlaces: false,
    };

    const res = await fetchWithTimeout(
      apifyUrl,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      9000
    );

    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        const place = items[0];

        let daysSinceLast = 114;
        if (Array.isArray(place.reviews) && place.reviews.length > 0) {
          const timestamps = place.reviews
            .map((r: { publishedAtDate?: string; timestamp?: number }) => {
              if (r.publishedAtDate) return new Date(r.publishedAtDate).getTime();
              if (r.timestamp) return r.timestamp;
              return 0;
            })
            .filter((t: number) => t > 0);

          if (timestamps.length > 0) {
            const newest = Math.max(...timestamps);
            daysSinceLast = Math.max(0, Math.floor((Date.now() - newest) / (1000 * 60 * 60 * 24)));
          }
        }

        return {
          gbp_rating: typeof place.totalScore === 'number' ? place.totalScore : place.rating ?? 4.8,
          gbp_review_count:
            typeof place.reviewsCount === 'number' ? place.reviewsCount : place.user_ratings_total ?? 32,
          days_since_last_review: daysSinceLast,
          gbp_primary_phone: place.phone || place.phoneUnformatted || null,
          business_name: place.title || place.name || null,
        };
      }
    }
  } catch (err) {
    console.warn(`Apify Google Maps lookup failed for ${businessName}.`, err);
  }

  return fallbackResult;
}

/**
 * Uploads screenshot to Cloudinary and overlays the high-contrast red/yellow warning banner.
 * Banner format: "MOBILE LOAD: 7.4s | NO BUDGET FILTER" inside device frame.
 */
export async function generateAnnotatedAuditImage(
  rootDomain: string,
  base64Screenshot: string | null,
  lcpSeconds: number = 7.4,
  hasCostCalc: boolean = false
): Promise<{ rawUrl: string | null; annotatedUrl: string }> {
  const calcText = hasCostCalc ? 'CALC OK' : 'NO BUDGET FILTER';
  const bannerText = `MOBILE LOAD: ${lcpSeconds.toFixed(1)}s | ${calcText}`;

  // If no Cloudinary configured or no screenshot available, provide high-converting preview placeholder
  if (!cloudName || !apiKey || !apiSecret || !base64Screenshot) {
    const encodedText = encodeURIComponent(bannerText);
    const placeholderUrl = `https://placehold.co/390x844/0a0a0a/FFD700.png?text=${encodeURIComponent(rootDomain)}%0A${encodedText}`;
    return {
      rawUrl: placeholderUrl,
      annotatedUrl: placeholderUrl,
    };
  }

  try {
    const uploadSource = base64Screenshot.startsWith('data:')
      ? base64Screenshot
      : `data:image/png;base64,${base64Screenshot}`;

    const uploadRes = await cloudinary.uploader.upload(uploadSource, {
      folder: 'opportunity-radar/audits',
      public_id: `${rootDomain.replace(/\./g, '_')}_${Date.now()}`,
      overwrite: true,
      transformation: [
        { width: 390, height: 844, crop: 'fill', gravity: 'north' },
      ],
    });

    const rawUrl = uploadRes.secure_url;

    // Apply high-contrast warning banner at top of mobile frame
    const bannerTransformation = [
      { width: 390, height: 844, crop: 'fill', gravity: 'north' },
      {
        color: '#FFFFFF',
        background: '#D32F2F', // Strong red warning banner
        overlay: {
          font_family: 'Arial',
          font_size: 16,
          font_weight: 'bold',
          text: bannerText,
        },
      },
      { flags: 'layer_apply', gravity: 'north', y: 15 },
    ];

    const annotatedUrl = cloudinary.url(uploadRes.public_id, {
      transformation: bannerTransformation,
      secure: true,
    });

    return { rawUrl, annotatedUrl };
  } catch (error) {
    console.warn(`Cloudinary upload failed for ${rootDomain}:`, error);
    const fallback = `https://placehold.co/390x844/0a0a0a/FFD700.png?text=${encodeURIComponent(rootDomain)}%0A${encodeURIComponent(bannerText)}`;
    return { rawUrl: fallback, annotatedUrl: fallback };
  }
}

/**
 * Uploads desktop screenshot to Cloudinary and overlays high-contrast desktop audit banner (1440x900).
 */
export async function generateAnnotatedDesktopImage(
  rootDomain: string,
  base64Screenshot: string | null,
  lcpSeconds: number = 4.2,
  hasCostCalc: boolean = false
): Promise<{ rawUrl: string | null; annotatedUrl: string }> {
  const calcText = hasCostCalc ? 'CALC OK' : 'NO BUDGET ESTIMATOR';
  const bannerText = `DESKTOP LOAD: ${lcpSeconds.toFixed(1)}s | ${calcText}`;

  if (!cloudName || !apiKey || !apiSecret || !base64Screenshot) {
    const encodedText = encodeURIComponent(bannerText);
    const placeholderUrl = `https://placehold.co/1280x800/0a0a0a/3B82F6.png?text=${encodeURIComponent(rootDomain)}%0ADESKTOP+AUDIT+(1440x900)%0A${encodedText}`;
    return {
      rawUrl: placeholderUrl,
      annotatedUrl: placeholderUrl,
    };
  }

  try {
    const uploadSource = base64Screenshot.startsWith('data:')
      ? base64Screenshot
      : `data:image/png;base64,${base64Screenshot}`;

    const uploadRes = await cloudinary.uploader.upload(uploadSource, {
      folder: 'opportunity-radar/audits-desktop',
      public_id: `${rootDomain.replace(/\./g, '_')}_desktop_${Date.now()}`,
      overwrite: true,
      transformation: [
        { width: 1440, height: 900, crop: 'fill', gravity: 'north' },
      ],
    });

    const rawUrl = uploadRes.secure_url;

    const bannerTransformation = [
      { width: 1440, height: 900, crop: 'fill', gravity: 'north' },
      {
        color: '#FFFFFF',
        background: '#1E40AF',
        overlay: {
          font_family: 'Arial',
          font_size: 20,
          font_weight: 'bold',
          text: bannerText,
        },
      },
      { flags: 'layer_apply', gravity: 'north', y: 20 },
    ];

    const annotatedUrl = cloudinary.url(uploadRes.public_id, {
      transformation: bannerTransformation,
      secure: true,
    });

    return { rawUrl, annotatedUrl };
  } catch (error) {
    console.warn(`Cloudinary desktop upload failed for ${rootDomain}:`, error);
    const fallback = `https://placehold.co/1280x800/0a0a0a/3B82F6.png?text=${encodeURIComponent(rootDomain)}%0A${encodeURIComponent(bannerText)}`;
    return { rawUrl: fallback, annotatedUrl: fallback };
  }
}

export interface SerpFallbackResult {
  owner_name: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
}

/**
 * Stage 2 Layer 2 Contact Fallback:
 * If owner name or social links are missing on-site, query ScrapingBee Google SERP:
 * `"{Business Name}" "{City}" (site:instagram.com OR site:facebook.com OR "owner")`
 */
export async function searchGoogleSerpFallback(
  businessName: string,
  city: string
): Promise<SerpFallbackResult> {
  const result: SerpFallbackResult = {
    owner_name: null,
    instagram_url: null,
    facebook_url: null,
  };

  const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!scrapingBeeApiKey || scrapingBeeApiKey.includes('...')) {
    // Return sample social fallback for dev
    return {
      owner_name: null,
      instagram_url: `https://instagram.com/${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      facebook_url: `https://facebook.com/${businessName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    };
  }

  const query = `"${businessName}" "${city}" (site:instagram.com OR site:facebook.com OR "owner")`;
  const endpoint = new URL('https://app.scrapingbee.com/api/v1/store/google');
  endpoint.searchParams.set('api_key', scrapingBeeApiKey);
  endpoint.searchParams.set('search', query);
  endpoint.searchParams.set('nb_results', '10');

  try {
    const res = await fetchWithTimeout(endpoint.toString(), {}, 8000);
    if (!res.ok) return result;

    const data = (await res.json()) as {
      organic_results?: Array<{ url: string; title: string; snippet: string }>;
    };

    if (data.organic_results) {
      for (const item of data.organic_results) {
        const u = item.url || '';
        const snippet = `${item.title} ${item.snippet}`;

        if (!result.instagram_url && u.includes('instagram.com/')) {
          const m = u.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]+)\/?/i);
          if (m && !['p', 'reel', 'stories', 'explore'].includes(m[1].toLowerCase())) {
            result.instagram_url = m[0].replace(/\/+$/, '');
          }
        }

        if (!result.facebook_url && u.includes('facebook.com/')) {
          const m = u.match(/https?:\/\/(?:www\.)?facebook\.com\/([a-zA-Z0-9_.-]+)\/?/i);
          if (m && !['sharer', 'share', 'tr', 'dialog'].includes(m[1].toLowerCase())) {
            result.facebook_url = m[0].replace(/\/+$/, '');
          }
        }

        if (!result.owner_name) {
          const ownerMatch = snippet.match(/(?:owner|founder|president|principal)[:\s\-–]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
          if (ownerMatch && ownerMatch[1] && !ownerMatch[1].toLowerCase().includes('kitchen') && !ownerMatch[1].toLowerCase().includes('remodel')) {
            result.owner_name = ownerMatch[1].trim();
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Layer 2 SERP fallback failed for ${businessName}:`, err);
  }

  return result;
}

export interface DiscoveredLead {
  url: string;
  businessName: string;
  is_running_google_ppc: boolean;
  is_running_google_lsa: boolean;
  organic_serp_rank: number | null;
}

/**
 * Stage 0: ScrapingBee Geo-SERP lead discovery.
 * Hunts for contractors in target city with Google LSA, PPC ads, and organic #8–#25 ranks.
 */
export async function discoverCitySerp(niche: string, targetCity: string): Promise<DiscoveredLead[]> {
  const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;

  if (!scrapingBeeApiKey || scrapingBeeApiKey.includes('...')) {
    // Realistic seed candidates for development & preview
    const cleanCity = targetCity.split(',')[0].trim().toLowerCase();
    return [
      {
        url: `https://apexremodeling${cleanCity}.com`,
        businessName: `Apex Kitchen & Bath ${targetCity.split(',')[0]}`,
        is_running_google_ppc: true,
        is_running_google_lsa: false,
        organic_serp_rank: 9,
      },
      {
        url: `https://pinnaclekitchens${cleanCity}.com`,
        businessName: `Pinnacle Design Build ${targetCity.split(',')[0]}`,
        is_running_google_ppc: false,
        is_running_google_lsa: true,
        organic_serp_rank: 12,
      },
      {
        url: `https://craftsmanbath${cleanCity}.com`,
        businessName: `Craftsman Remodeling Co`,
        is_running_google_ppc: true,
        is_running_google_lsa: true,
        organic_serp_rank: 15,
      },
      {
        url: `https://heritagekitchens${cleanCity}.com`,
        businessName: `Heritage Kitchen & Bath`,
        is_running_google_ppc: false,
        is_running_google_lsa: false,
        organic_serp_rank: 18,
      },
    ];
  }

  const query = `${niche} in ${targetCity}`;
  const endpoint = new URL('https://app.scrapingbee.com/api/v1/store/google');
  endpoint.searchParams.set('api_key', scrapingBeeApiKey);
  endpoint.searchParams.set('search', query);
  endpoint.searchParams.set('nb_results', '30');

  try {
    const res = await fetchWithTimeout(endpoint.toString(), {}, 10000);
    if (!res.ok) return [];

    const data = (await res.json()) as {
      ads?: Array<{ url: string; title: string }>;
      organic_results?: Array<{ url: string; title: string; position: number }>;
    };

    const discovered: DiscoveredLead[] = [];

    // Extract paid search ads
    if (data.ads && Array.isArray(data.ads)) {
      for (const ad of data.ads) {
        if (ad.url) {
          discovered.push({
            url: ad.url,
            businessName: ad.title || 'Local Home Service Contractor',
            is_running_google_ppc: true,
            is_running_google_lsa: false,
            organic_serp_rank: null,
          });
        }
      }
    }

    // Extract organic listings, focusing on ranks #8–#25 (prime bleeders)
    if (data.organic_results && Array.isArray(data.organic_results)) {
      for (const org of data.organic_results) {
        if (org.url) {
          discovered.push({
            url: org.url,
            businessName: org.title || 'Local Home Service Contractor',
            is_running_google_ppc: false,
            is_running_google_lsa: false,
            organic_serp_rank: org.position || null,
          });
        }
      }
    }

    return discovered;
  } catch (err) {
    console.warn(`City SERP discovery failed for ${niche} in ${targetCity}:`, err);
    return [];
  }
}
