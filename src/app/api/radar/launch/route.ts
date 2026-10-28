// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — CITY RADAR LAUNCH ROUTE
// POST /api/radar/launch
// Document References: docs/04-TRD.md Section 4.2 & GEMINI.md Hard Lock 3
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isTargetCityInPeakAdHours, getNextPeakWindowTimestamp } from '@/lib/timezoneGuard';
import { discoverCitySerp } from '@/lib/visualProof';
import { isBlockedOrDirectory } from '@/lib/auditEngine';
import { executeSingleAudit } from '@/lib/auditOrchestrator';
import { checkRateLimit } from '@/lib/rateLimit';
import { RadarLaunchRequest, RadarCampaignRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RadarLaunchRequest;
    // Abuse & ScrapingBee Credit Protection: Max 5 bulk radar launches per 10 minutes per IP
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    const rateCheck = checkRateLimit(`radar:${clientIp}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Bulk discovery limit reached. Please wait ${rateCheck.retryAfterSeconds}s before launching another radar job.`,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) },
        }
      );
    }
    const { niche, target_city, target_timezone, force_run_now } = body;

    if (!niche || !target_city || !target_timezone) {
      return NextResponse.json(
        { success: false, error: 'niche, target_city, and target_timezone are required.' },
        { status: 400 }
      );
    }

    // LOCK 3: WAT-to-Target-City Timezone Guard (09:00-16:59 peak ad hours)
    const tzCheck = isTargetCityInPeakAdHours(target_timezone);

    if (!tzCheck.inPeakWindow && !force_run_now) {
      const scheduledFor = getNextPeakWindowTimestamp(target_timezone);

      const campaignPayload = {
        niche,
        target_city,
        target_timezone,
        status: 'queued',
        scheduled_for: scheduledFor.toISOString(),
      };

      let queuedCampaign: RadarCampaignRecord | null = null;
      try {
        const { data, error } = await supabaseAdmin
          .from('radar_campaigns')
          .insert(campaignPayload)
          .select()
          .single();

        if (error) throw error;
        queuedCampaign = data as RadarCampaignRecord;
      } catch (dbErr) {
        console.warn('Supabase campaign insert fallback (offline/demo mode):', dbErr);
        queuedCampaign = {
          id: `camp-${Date.now()}`,
          ...campaignPayload,
          status: 'queued',
          total_domains_found: 0,
          blocked_or_duplicate_count: 0,
          qualified_leads_count: 0,
          started_at: null,
          completed_at: null,
          error_log: null,
          created_at: new Date().toISOString(),
        };
      }

      return NextResponse.json({
        success: true,
        queued: true,
        message: `Target city (${target_city}) is currently outside peak contractor ad hours (09:00–16:59 local). Campaign scheduled for ${scheduledFor.toLocaleTimeString()} local (${tzCheck.watTimeFormatted}).`,
        scheduled_for: scheduledFor.toISOString(),
        local_time: tzCheck.localTimeFormatted,
        wat_time: tzCheck.watTimeFormatted,
        campaign: queuedCampaign,
      });
    }

    // Peak window is active or operator forced run now
    let campaignId = `camp-${Date.now()}`;
    try {
      const { data: campaignRecord, error: startErr } = await supabaseAdmin
        .from('radar_campaigns')
        .insert({
          niche,
          target_city,
          target_timezone,
          status: 'running_serp',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (!startErr && campaignRecord) {
        campaignId = campaignRecord.id;
      }
    } catch (e) {
      console.warn('Supabase start campaign skipped/failed:', e);
    }

    // Stage 0: ScrapingBee Geo-SERP Discovery
    const discoveredLeads = await discoverCitySerp(niche, target_city);
    let blockedOrDuplicateCount = 0;
    const cleanCandidates: typeof discoveredLeads = [];

    // Filter against LOCK 1 Blocklist and deduplicate against Supabase
    for (const lead of discoveredLeads) {
      const bouncer = isBlockedOrDirectory(lead.url);
      if (bouncer.isBlocked) {
        blockedOrDuplicateCount++;
        continue;
      }

      // Check for deduplication in database
      try {
        const { data: existing } = await supabaseAdmin
          .from('prospects')
          .select('id, last_audited_at')
          .eq('root_domain', bouncer.rootDomain)
          .maybeSingle();

        if (existing) {
          const lastAudited = new Date(existing.last_audited_at);
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          if (lastAudited > thirtyDaysAgo) {
            blockedOrDuplicateCount++;
            continue;
          }
        }
      } catch {
        // Continue if offline
      }

      cleanCandidates.push(lead);
    }

    // Update campaign with discovery metrics & transition to 'auditing'
    try {
      await supabaseAdmin
        .from('radar_campaigns')
        .update({
          total_domains_found: discoveredLeads.length,
          blocked_or_duplicate_count: blockedOrDuplicateCount,
          status: 'auditing',
        })
        .eq('id', campaignId);
    } catch {
      // Ignore offline error
    }

    // Process clean candidates in batches of 3 (up to 12 candidates)
    const candidatesToAudit = cleanCandidates.slice(0, 12);
    let qualifiedLeadsCount = 0;

    for (let i = 0; i < candidatesToAudit.length; i += 3) {
      const batch = candidatesToAudit.slice(i, i + 3);
      const batchPromises = batch.map((item) =>
        executeSingleAudit({
          url: item.url,
          city: target_city,
          is_running_google_ppc: item.is_running_google_ppc,
          is_running_google_lsa: item.is_running_google_lsa,
          organic_serp_rank: item.organic_serp_rank,
          campaign_id: campaignId,
          force_refresh: false,
        }).catch((err) => {
          console.warn(`Audit failed for candidate ${item.url}:`, err);
          return null;
        })
      );

      const batchResults = await Promise.all(batchPromises);
      qualifiedLeadsCount += batchResults.filter(Boolean).length;
    }

    // Mark campaign completed
    try {
      await supabaseAdmin
        .from('radar_campaigns')
        .update({
          status: 'completed',
          qualified_leads_count: qualifiedLeadsCount,
          completed_at: new Date().toISOString(),
        })
        .eq('id', campaignId);
    } catch {
      // Ignore offline error
    }

    return NextResponse.json({
      success: true,
      queued: false,
      campaign_id: campaignId,
      total_domains_found: discoveredLeads.length,
      blocked_or_duplicate_count: blockedOrDuplicateCount,
      qualified_leads_count: qualifiedLeadsCount,
      message: `Radar completed. Audited ${qualifiedLeadsCount} qualified home service businesses in ${target_city}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Radar launch error:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
