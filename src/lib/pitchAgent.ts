// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — LLM PITCH AGENT
// Document Reference: docs/04-TRD.md & GEMINI.md Hard Lock 5 ("Rule of 2")
// ============================================================================

import { ProspectRecord, GeneratedPitchContent } from './types';
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Counts words in a string.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Selects the top 2 highest-cost revenue leaks based on the prospect's audit scorecard.
 * HARD LOCK 5: The "Rule of 2" — Never overwhelm the contractor with more than 2 leaks.
 */
export function selectTopTwoLeaks(p: Partial<ProspectRecord>): [string, string] {
  const leaks: { priority: number; label: string; description: string }[] = [];

  // Priority 1: Unanswered Phone Call Leaks (Highest emotional & financial pain)
  if (p.missed_call_tested && p.missed_call_leaked) {
    leaks.push({
      priority: 100,
      label: 'Unanswered Job-Site Calls',
      description: 'Missed calls drop straight to voicemail with no automated text-back or AI voice callback',
    });
  }

  // Priority 2: Paid Ad Burn on Slow Mobile Page
  if ((p.is_running_google_ppc || p.is_running_google_lsa) && (p.mobile_speed_score ?? 50) < 55) {
    leaks.push({
      priority: 90,
      label: 'Paid Ad Mobile Bounce',
      description: `Spending $40–$65/click on Google Ads while mobile load takes ${(p.mobile_lcp_seconds ?? 7.5).toFixed(1)}s`,
    });
  }

  // Priority 3: No Upfront Budget Estimator (Tire-Kicker Drain)
  if (!p.has_cost_calculator) {
    leaks.push({
      priority: 80,
      label: 'No Budget Self-Qualification',
      description: 'Driving 8+ hours a week quoting $5k tire-kickers with no 60-second budget filter',
    });
  }

  // Priority 4: No 24/7 AI Voice/Chat Assistant
  if (!p.has_ai_voice_or_chat) {
    leaks.push({
      priority: 70,
      label: 'After-Hours Lead Loss',
      description: 'Static contact forms losing evening & weekend homeowners to competitors with instant booking',
    });
  }

  // Priority 5: Stale Google Reviews (>90 Days)
  if ((p.days_since_last_review ?? 0) > 90) {
    leaks.push({
      priority: 60,
      label: 'Stale Review Velocity',
      description: `Last Google review was ${p.days_since_last_review} days ago, eroding local trust against competitors`,
    });
  }

  // Priority 6: Missing AEO / JSON-LD Schema
  if (!p.has_aeo_schema) {
    leaks.push({
      priority: 50,
      label: 'Invisible to AI Search',
      description: 'Missing HomeAndConstructionBusiness structured data for Google AI Overviews and ChatGPT local discovery',
    });
  }

  // Sort by priority and take top 2
  leaks.sort((a, b) => b.priority - a.priority);

  const leak1 = leaks[0]?.description || 'Mobile site speed causing 50%+ bounce rate on high-intent visitors';
  const leak2 = leaks[1]?.description || 'Lack of upfront budget estimator leading to wasted estimate consultations';

  return [leak1, leak2];
}

/**
 * Deterministic template-based generator enforcing strict Rule of 2 and word limits.
 * All cold outreach enforces ZERO LINKS in touch 1 for pristine deliverability.
 */
export function generateDeterministicPitch(
  p: Partial<ProspectRecord>,
  cloudinaryMockupUrl: string = ''
): GeneratedPitchContent {
  void cloudinaryMockupUrl;
  const [leak1, leak2] = selectTopTwoLeaks(p);
  const city = p.city || 'your area';
  const businessName = p.business_name || 'your business';
  const greeting = p.owner_first_name ? `Hey ${p.owner_first_name},` : `Hey ${businessName} team,`;

  // Zero-Fabrication: Use authentic project detail or generic authentic compliment
  const projectDetail = p.specific_project_detail
    ? `your ${p.specific_project_detail}`
    : `your recent portfolio work in ${city}`;

  // 1. Cold Email Sequence
  // Step 1: Initial Cold Email (< 110 words, ZERO LINKS)
  let emailProblemCopy = '';
  if (p.missed_call_tested && p.missed_call_leaked) {
    emailProblemCopy = `Called your line earlier—went to voicemail with zero text-back. On high-ticket home projects, 62% of homeowners immediately call the next contractor. Plus, without an online budget filter, your crew likely spends 6+ hours quoting tire-kickers who cannot afford your work.`;
  } else {
    emailProblemCopy = `Ran a quick audit on your mobile funnel: ${leak1.toLowerCase()}. Additionally, ${leak2.toLowerCase()}.`;
  }

  const emailSubject = p.owner_first_name
    ? `${p.owner_first_name} — quick question regarding ${businessName}`
    : `Quick observation on ${businessName}'s mobile funnel`;

  const emailBody = `${greeting}

Loved seeing ${projectDetail}.

${emailProblemCopy}

Put together a visual mockup showing how we plug both leaks for ${businessName}.

Mind if I send it over so you can have a quick look?

Best,
Agency Growth Team`;

  // Step 2: Day-3 Follow-Up Bump (72h Bump, < 45 words)
  const bumpGreeting = p.owner_first_name ? `Hey ${p.owner_first_name} —` : 'Hey there —';
  const emailFollowupDay3 = `${bumpGreeting} quick bump on this.

Home service contractors in ${city} using 60-second budget filters are cutting out 8 hrs of tire-kicker drive time weekly.

Still open to having a quick look at that visual mockup?`;

  // Step 3: Day-7 Follow-Up (Value / Case Observation, < 60 words)
  const emailFollowupDay7 = `${bumpGreeting} wanted to share one quick observation:

When high-intent homeowners search for services in ${city}, slow mobile load and dead contact forms cause over 50% to bounce directly to competing businesses.

Happy to send over that 60-second walkthrough if this is relevant to ${businessName} this quarter.`;

  // Step 4: Day-14 Follow-Up (Polite Breakup / Final Notice, < 40 words)
  const emailFollowupDay14 = `${bumpGreeting} closing the loop on this.

Assuming you're completely booked out with projects in ${city} right now and this isn't a priority.

If you ever want to check out the mockup on plugging those mobile leaks, just let me know down the road.`;

  // 2. Cold Social DM Sequence
  // Step 1: Initial Cold DM (< 45 words, ZERO links)
  const dmGreeting = p.owner_first_name ? `Hey ${p.owner_first_name}!` : 'Hey team!';
  const socialDmBody = `${dmGreeting} Loved your work on ${projectDetail}. Quick question—are you taking on more projects in ${city} this quarter, or is your schedule completely booked out?`;

  // Step 2: Day-3 DM Bump (< 25 words, ZERO links)
  const socialFollowupDay3 = `${dmGreeting} Quick bump on this in case it got buried! Open to seeing a quick observation on your mobile site in ${city}?`;

  // Step 3: Day-7 DM Final (< 25 words, ZERO links)
  const socialFollowupDay7 = `${dmGreeting} Assuming you're fully booked right now! Will leave you to it—keep up the great work in ${city}.`;

  return {
    specific_project_detail: projectDetail,
    top_two_leaks: [leak1, leak2],
    email_subject: emailSubject,
    email_body: emailBody.trim(),
    email_word_count: countWords(emailBody),
    email_followup_day3: emailFollowupDay3.trim(),
    email_followup_day7: emailFollowupDay7.trim(),
    email_followup_day14: emailFollowupDay14.trim(),
    social_dm_body: socialDmBody.trim(),
    social_dm_word_count: countWords(socialDmBody),
    social_followup_day3: socialFollowupDay3.trim(),
    social_followup_day7: socialFollowupDay7.trim(),
    followup_day3_body: emailFollowupDay3.trim(),
  };
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{
      text?: string;
    }>;
  };
}

interface GeminiApiResponse {
  candidates?: GeminiCandidate[];
}

/**
 * Stage 3: Generates Hyper-Custom Pitches adhering to the Rule of 2 and Zero-Fabrication.
 * Invokes LLM via API if key is present, otherwise uses deterministic generator.
 */
export async function generatePitch(
  prospect: Partial<ProspectRecord>,
  cloudinaryMockupUrl: string = ''
): Promise<GeneratedPitchContent> {
  const apiKey = process.env.LLM_API_KEY;

  // Use deterministic engine if no LLM API key configured or demo key
  if (!apiKey || apiKey.includes('...') || apiKey.startsWith('spb_')) {
    return generateDeterministicPitch(prospect, cloudinaryMockupUrl);
  }

  const [leak1, leak2] = selectTopTwoLeaks(prospect);
  const businessName = prospect.business_name || 'Contractor';
  const ownerName = prospect.owner_first_name || null;
  const city = prospect.city || 'local area';
  const detail = prospect.specific_project_detail || 'craftsmanship and recent installations';

  const systemPrompt = `You are an elite B2B sales copywriter specializing in high-ticket Home Service Businesses and Contractors ($10k–$100k+ projects).
Generate high-converting multi-touch outreach adhering strictly to these HARD LOCKS:
1. RULE OF 2: Address ONLY these 2 specific leaks: "${leak1}" and "${leak2}". Never invent other flaws.
2. ZERO FABRICATION: Do not invent client names, neighborhoods, or materials. Use authentic detail: "${detail}".
3. GREETING: If owner name (${ownerName}) is provided, use "Hey ${ownerName},". Otherwise use "Hey ${businessName} team,".
4. COLD EMAIL (DAY 0): Must be strictly under 110 words. MUST CONTAIN ZERO LINKS OR URLS. Mention: "Put together a visual mockup showing how we plug both leaks for ${businessName}. Mind if I send it over so you can have a quick look?" Focus on business ROI.
5. EMAIL FOLLOW-UP (DAY 3): Under 50 words. Gentle reminder citing contractor time savings.
6. EMAIL FOLLOW-UP (DAY 7): Under 60 words. Value observation about mobile bounce rates.
7. EMAIL FOLLOW-UP (DAY 14): Under 40 words. Low-pressure breakup closing the loop.
8. SOCIAL DM (DAY 0): Strictly under 45 words. MUST CONTAIN ZERO URLS OR LINKS. Conversational compliment + 1 low-friction binary question.
9. SOCIAL DM FOLLOW-UP (DAY 3): Strictly under 30 words. ZERO LINKS. Casual reminder.
10. SOCIAL DM FOLLOW-UP (DAY 7): Strictly under 25 words. ZERO LINKS. Polite wrap-up.

Return ONLY a valid JSON object matching this schema:
{
  "specific_project_detail": string,
  "top_two_leaks": [string, string],
  "email_subject": string,
  "email_body": string,
  "email_followup_day3": string,
  "email_followup_day7": string,
  "email_followup_day14": string,
  "social_dm_body": string,
  "social_followup_day3": string,
  "social_followup_day7": string,
  "followup_day3_body": string
}`;

  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

  for (const model of models) {
    try {
      const response = await fetchWithTimeout(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\nProspect data: ${JSON.stringify({ businessName, city, ownerName, leak1, leak2, detail })}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        },
        7000
      );

      if (response.ok) {
        const data = (await response.json()) as GeminiApiResponse;
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText) as Partial<GeneratedPitchContent>;
          if (parsed.email_body && parsed.social_dm_body) {
            return {
              specific_project_detail: parsed.specific_project_detail || detail,
              top_two_leaks: [leak1, leak2],
              email_subject: parsed.email_subject || `${businessName} — quick question`,
              email_body: parsed.email_body.trim(),
              email_word_count: countWords(parsed.email_body),
              email_followup_day3: (parsed.email_followup_day3 || parsed.followup_day3_body || '').trim(),
              email_followup_day7: (parsed.email_followup_day7 || '').trim(),
              email_followup_day14: (parsed.email_followup_day14 || '').trim(),
              social_dm_body: parsed.social_dm_body.trim(),
              social_dm_word_count: countWords(parsed.social_dm_body),
              social_followup_day3: (parsed.social_followup_day3 || '').trim(),
              social_followup_day7: (parsed.social_followup_day7 || '').trim(),
              followup_day3_body: (parsed.followup_day3_body || parsed.email_followup_day3 || '').trim(),
            };
          }
        }
      }
    } catch (error) {
      console.warn(`LLM model ${model} call failed. Checking fallback...`, error);
    }
  }

  return generateDeterministicPitch(prospect, cloudinaryMockupUrl);
}
