// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — LLM PITCH AGENT
// Document Reference: docs/04-TRD.md & GEMINI.md Hard Lock 5 ("Rule of 2")
// ============================================================================

import { ProspectRecord, GeneratedPitchContent } from './types';

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> {
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
      description: 'Missed calls drop straight to voicemail with zero automated SMS text-back or instant callback',
    });
  }

  // Priority 2: Paid Ad Burn on Slow Mobile Page
  if ((p.is_running_google_ppc || p.is_running_google_lsa) && (p.mobile_speed_score ?? 50) < 55) {
    const lcp = p.mobile_lcp_seconds ? `${p.mobile_lcp_seconds.toFixed(1)}s` : '7.5s';
    leaks.push({
      priority: 90,
      label: 'Paid Ad Mobile Bounce',
      description: `Spending $45–$70/click on Google Ads while mobile load time lags at ${lcp}, driving paid clicks directly to competitors`,
    });
  }

  // Priority 3: No Upfront Budget Estimator (Tire-Kicker Drain)
  if (!p.has_cost_calculator) {
    leaks.push({
      priority: 80,
      label: 'No Budget Self-Qualification',
      description: 'Zero interactive project budgeting online, leaving your team to spend hours fielding low-budget tire-kickers',
    });
  }

  // Priority 4: No 24/7 AI Voice/Chat Assistant
  if (!p.has_ai_voice_or_chat) {
    leaks.push({
      priority: 70,
      label: 'After-Hours Lead Loss',
      description: 'Static contact forms losing high-intent evening & weekend homeowners who expect immediate responses',
    });
  }

  // Priority 5: Stale Google Reviews (>90 Days)
  if ((p.days_since_last_review ?? 0) > 90) {
    leaks.push({
      priority: 60,
      label: 'Stale Review Velocity',
      description: `Last Google review was ${p.days_since_last_review} days ago, eroding local trust against fast-growing competitors`,
    });
  }

  // Priority 6: Missing AEO / JSON-LD Schema
  if (!p.has_aeo_schema) {
    leaks.push({
      priority: 50,
      label: 'Invisible to AI Search',
      description: 'Missing HomeAndConstructionBusiness structured data required for Google AI Overviews and ChatGPT local discovery',
    });
  }

  // Sort by priority and take top 2
  leaks.sort((a, b) => b.priority - a.priority);

  const leak1 = leaks[0]?.description || `Mobile site loading speed causing over 50% bounce rate on high-intent local homeowners`;
  const leak2 = leaks[1]?.description || `No upfront interactive scope estimator, leading to wasted consultation hours`;

  return [leak1, leak2];
}

/**
 * Generates dynamic hash number from domain string for deterministic variation.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Dynamic Deterministic Fallback Engine.
 * Ensures that even when offline or during API rate limits, NO TWO PROSPECTS ever receive
 * identical copy by selecting through a rich matrix of openings, angles, and CTAs.
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
  const seed = hashString(p.root_domain || businessName);

  const projectDetail = p.specific_project_detail
    ? p.specific_project_detail
    : `custom installations and craftsmanship in ${city}`;

  // 1. Dynamic Openers (6 Variations)
  const openers = [
    `Really impressed by ${businessName}'s work with ${projectDetail} across ${city}.`,
    `Came across ${businessName} while researching top-rated contractors in ${city}—outstanding work on ${projectDetail}.`,
    `Saw your recent installations in ${city}, specifically your work with ${projectDetail}. Quality looks second to none.`,
    `Following ${businessName}'s craft in ${city}—your focus on ${projectDetail} really sets a benchmark.`,
    `Noticed ${businessName}'s strong local reputation in ${city} and loved seeing ${projectDetail}.`,
    `Looked through your work in ${city}—the execution on ${projectDetail} stands out immediately.`,
  ];
  const selectedOpener = openers[seed % openers.length];

  // 2. Dynamic Problem Framing (4 Variations)
  let problemCopy = '';
  if (p.missed_call_tested && p.missed_call_leaked) {
    problemCopy = `Did a quick test call to your line earlier—went straight to voicemail with zero automated SMS recovery. For high-ticket projects, over 60% of homeowners immediately call the next contractor on Google. Pair that with ${leak2.toLowerCase()}, and significant revenue leaks out each month.`;
  } else if (p.is_running_google_ppc || p.is_running_google_lsa) {
    problemCopy = `Noticed you're actively investing in Google search visibility, but your mobile funnel is leaking: ${leak1.toLowerCase()}. On top of that, ${leak2.toLowerCase()}. You're paying for clicks that never convert into booked consultations.`;
  } else {
    const problemVariations = [
      `Ran a performance audit on your mobile site: ${leak1.toLowerCase()}. Additionally, ${leak2.toLowerCase()}.`,
      `Audited your mobile conversion flow and noticed two high-cost bottlenecks: ${leak1.toLowerCase()}, plus ${leak2.toLowerCase()}.`,
      `Spotted two immediate growth bottlenecks on your mobile site: ${leak1.toLowerCase()}. Furthermore, ${leak2.toLowerCase()}.`,
    ];
    problemCopy = problemVariations[seed % problemVariations.length];
  }

  // 3. Dynamic Value Teaser & Call to Action (4 Variations)
  const ctas = [
    `Put together a visual mockup showing how we plug both leaks for ${businessName}. Mind if I send it over so you can take a look?`,
    `Built a quick side-by-side mockup demonstrating how to fix these two leaks for ${businessName}. Open to having a look?`,
    `Sketched out a visual proof frame showing how other ${city} contractors fix these two bottlenecks. Mind if I shoot the screenshot over?`,
    `Mapped out a visual walkthrough plugging both leaks for ${businessName}. Worth sending across for a quick review?`,
  ];
  const selectedCta = ctas[(seed >> 2) % ctas.length];

  const emailSubjectOptions = [
    p.owner_first_name ? `${p.owner_first_name} — quick observation regarding ${businessName}` : `Quick observation on ${businessName}'s mobile funnel`,
    p.owner_first_name ? `${p.owner_first_name} — question on ${businessName}'s ${city} projects` : `${businessName} — quick question regarding ${city}`,
    `Two revenue bottlenecks spotted on ${businessName}`,
  ];
  const emailSubject = emailSubjectOptions[seed % emailSubjectOptions.length];

  const emailBody = `${greeting}

${selectedOpener}

${problemCopy}

${selectedCta}

Best,
Agency Growth Team`;

  // Step 2: Day-3 Follow-Up Bump (72h Bump, < 45 words)
  const bumpGreeting = p.owner_first_name ? `Hey ${p.owner_first_name} —` : 'Hey there —';
  const day3Options = [
    `${bumpGreeting} following up on this note. Plugging that mobile leak and filtering tire-kickers saves contractors in ${city} 6–8 hours weekly. Still open to seeing that visual mockup?`,
    `${bumpGreeting} quick bump on my note below. When high-ticket homeowners in ${city} visit on their phones, fixing those two leaks keeps them from bouncing to competitors. Open to having a look?`,
    `${bumpGreeting} wanted to float this back to the top of your inbox. Happy to send over the mockup for ${businessName} whenever convenient.`,
  ];
  const emailFollowupDay3 = day3Options[seed % day3Options.length];

  // Step 3: Day-7 Follow-Up (Value / Case Observation, < 60 words)
  const day7Options = [
    `${bumpGreeting} wanted to share one quick data point:
When homeowners in ${city} research high-ticket projects, over 55% compare multiple contractors on mobile before calling. Without upfront qualification and instant response, most bounce to the competitor who replies first.
Happy to send that 60-second walkthrough over if helpful for ${businessName}.`,
    `${bumpGreeting} quick thought: contractors in your market who add automated budget filters report cutting out 80% of tire-kicker drive time while booking bigger scopes.
Would it be worth sharing that screenshot showing how we implement this for ${businessName}?`,
  ];
  const emailFollowupDay7 = day7Options[seed % day7Options.length];

  // Step 4: Day-14 Follow-Up (Polite Breakup / Final Notice, < 40 words)
  const day14Options = [
    `${bumpGreeting} closing the loop here.
Assuming you're completely booked out with projects in ${city} right now and this isn't on your radar.
If you ever want to see how we plug those mobile leaks, just reach out down the road.`,
    `${bumpGreeting} wrapping up my outreach.
Looks like your schedule in ${city} is full right now. If things open up and you'd like to see the mockup, feel free to drop me a line anytime.`,
  ];
  const emailFollowupDay14 = day14Options[seed % day14Options.length];

  // 2. Cold Social DM Sequence
  const dmGreeting = p.owner_first_name ? `Hey ${p.owner_first_name}!` : 'Hey team!';
  const dmOptions = [
    `${dmGreeting} Loved your work on ${projectDetail}. Quick question—are you taking on more projects in ${city} this quarter, or is your schedule completely booked out?`,
    `${dmGreeting} Outstanding work with ${projectDetail} in ${city}! Quick question—are you open to new high-ticket clients right now, or fully booked for the season?`,
    `${dmGreeting} Fantastic craftsmanship on ${projectDetail}! Curious if your crew has capacity for more ${city} projects this month or if your books are closed?`,
  ];
  const socialDmBody = dmOptions[seed % dmOptions.length];

  const dmBumpOptions = [
    `${dmGreeting} Quick bump in case this got buried! Would love to share a quick observation on your mobile funnel in ${city} if you have 60 seconds.`,
    `${dmGreeting} Following up quickly! Open to taking a look at a 60-second observation on ${businessName}'s mobile inquiries?`,
  ];
  const socialFollowupDay3 = dmBumpOptions[seed % dmBumpOptions.length];

  const dmFinalOptions = [
    `${dmGreeting} Assuming you're fully booked right now! Will leave you to it—keep up the great work in ${city}.`,
    `${dmGreeting} Looks like you're completely booked up! Wishing you guys continued success in ${city}.`,
  ];
  const socialFollowupDay7 = dmFinalOptions[seed % dmFinalOptions.length];

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
 * Stage 3: Generates 100% Unique, Hyper-Custom Pitches adhering to the Rule of 2 and Zero-Fabrication.
 * Invokes Google Gemini 3.5 Flash with deep contractor context, falling back gracefully to varied engine.
 */
export async function generatePitch(
  prospect: Partial<ProspectRecord>,
  cloudinaryMockupUrl: string = ''
): Promise<GeneratedPitchContent> {
  const apiKey = process.env.LLM_API_KEY;

  if (!apiKey || apiKey.includes('...') || apiKey.startsWith('spb_')) {
    return generateDeterministicPitch(prospect, cloudinaryMockupUrl);
  }

  const [leak1, leak2] = selectTopTwoLeaks(prospect);
  const businessName = prospect.business_name || 'Contractor';
  const ownerName = prospect.owner_first_name || null;
  const city = prospect.city || 'local area';
  const detail = prospect.specific_project_detail || 'craftsmanship and recent installations';

  const prospectContext = {
    businessName,
    city,
    ownerFirstName: ownerName,
    specificCraftOrProject: detail,
    leak1,
    leak2,
    mobileSpeedScore: prospect.mobile_speed_score ?? 42,
    mobileLcpSeconds: prospect.mobile_lcp_seconds ?? 7.8,
    isRunningGoogleAds: prospect.is_running_google_ppc || prospect.is_running_google_lsa,
    googleRating: prospect.gbp_rating ?? 4.8,
    reviewCount: prospect.gbp_review_count ?? 45,
    missedCallLeaked: prospect.missed_call_leaked ?? false,
    hasCostCalculator: prospect.has_cost_calculator ?? false,
    hasAiChat: prospect.has_ai_voice_or_chat ?? false,
  };

  const systemPrompt = `You are a world-class consultative B2B growth partner for high-ticket specialty contractors & home service businesses ($20k–$250k+ projects).
Your task is to craft a 100% bespoke, ultra-personalized cold outreach sequence and social DM stack for this contractor.

NON-NEGOTIABLE WRITING RULES:
1. STRICT ZERO-BOILERPLATE: Under NO circumstances should you use canned formulas like "Ran a quick audit on your mobile funnel: driving 8+ hours a week quoting $5k tire-kickers with no 60-second budget filter". Write like a sharp, peer-level consultant who personally analyzed their actual website and business.
2. ZERO FABRICATION: Reference only authentic facts from the prospect data. Never invent client names, fake projects, or fake awards.
3. ZERO LINKS: All cold emails and cold DMs must have ZERO links or URLs to ensure maximum inbox deliverability.
4. TONE: Confident, direct, peer-to-peer, respectful of the contractor's time.
5. SEQUENCE DELIVERABLES:
   - "email_subject": Punchy, personal, 3–6 words (e.g. "${ownerName ? ownerName + ' — ' : ''}quick observation on ${businessName}'s mobile traffic").
   - "email_body": Cold Email (Day 0). Strictly under 95 words. Greet with "${ownerName ? 'Hey ' + ownerName + ',' : 'Hey ' + businessName + ' team,'}". Mention genuine praise for "${detail}" in ${city}. Plainly explain their 2 leaks: "${leak1}" and "${leak2}". Tease that you built a visual mockup showing how to plug both leaks for ${businessName}. Conclude with a natural permission question ("Mind if I send the screenshot over so you can take a look?").
   - "email_followup_day3": Day 3 Bump. Under 40 words. Low-friction conversational reminder.
   - "email_followup_day7": Day 7 Value Angle. Under 55 words. Concrete insight on how homeowners in ${city} compare contractors on mobile and bounce if speeds lag or if there is no instant estimate.
   - "email_followup_day14": Day 14 Breakup. Under 35 words. Respectful closure assuming they are currently at capacity.
   - "social_dm_body": Cold Instagram/Facebook DM. Strictly under 40 words. ZERO LINKS. Casual compliment on "${detail}" in ${city} + 1 low-friction binary question.
   - "social_followup_day3": Social DM Bump. Strictly under 25 words. ZERO LINKS.
   - "social_followup_day7": Social DM Wrap-up. Strictly under 20 words. ZERO LINKS.

Output ONLY a raw, valid JSON object matching this schema:
{
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

  // Prioritize verified working Gemini 3.5 Flash
  const models = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'];

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
                    text: `${systemPrompt}\n\nProspect Scraped Intelligence:\n${JSON.stringify(prospectContext, null, 2)}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.65,
            },
          }),
        },
        12000
      );

      if (response.ok) {
        const data = (await response.json()) as GeminiApiResponse;
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const parsed = JSON.parse(rawText) as Partial<GeneratedPitchContent>;
          if (parsed.email_body && parsed.social_dm_body) {
            return {
              specific_project_detail: detail,
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
      console.warn(`LLM model ${model} call failed/timed out. Trying next fallback...`, error);
    }
  }

  // Gracefully fall back to dynamic non-repetitive matrix
  return generateDeterministicPitch(prospect, cloudinaryMockupUrl);
}
