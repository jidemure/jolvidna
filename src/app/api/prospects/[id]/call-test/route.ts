// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — LIVE CALL TEST OVERRIDE ROUTE
// PATCH /api/prospects/[id]/call-test
// Document Reference: docs/04-TRD.md Section 4.3
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { calculateLeakScore } from '@/lib/auditEngine';
import { generateDeterministicPitch } from '@/lib/pitchAgent';
import { CallTestRequest, ProspectRecord, PitchRecord } from '@/lib/types';
import { INITIAL_DEMO_PROSPECTS, INITIAL_DEMO_PITCHES } from '@/lib/seedData';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as CallTestRequest;
    const { missed_call_leaked } = body;

    // 1. Fetch current prospect (with 4-second timeout circuit breaker)
    let prospect: ProspectRecord | null = null;

    try {
      const fetchPromise = supabaseAdmin
        .from('prospects')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error('Supabase query timeout') }), 4000)
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res && 'data' in res && res.data) {
        prospect = res.data as ProspectRecord;
      }
    } catch (err) {
      console.warn('Supabase fetch failed or timed out for call-test:', err);
    }

    // Fallback to local demo dataset if not in Supabase or Supabase offline
    if (!prospect) {
      const demo = INITIAL_DEMO_PROSPECTS.find((p) => p.id === id);
      const baseProspect: ProspectRecord = demo || { ...INITIAL_DEMO_PROSPECTS[0], id };

      const updatedDemo: ProspectRecord = {
        ...baseProspect,
        missed_call_tested: true,
        missed_call_leaked: Boolean(missed_call_leaked),
        leak_score: calculateLeakScore({
          ...baseProspect,
          missed_call_tested: true,
          missed_call_leaked: Boolean(missed_call_leaked),
        }),
        updated_at: new Date().toISOString(),
      };

      const newPitchContent = generateDeterministicPitch(
        updatedDemo,
        updatedDemo.cloudinary_annotated_mockup_url || ''
      );

      const existingPitch = INITIAL_DEMO_PITCHES[id];
      const updatedPitch: PitchRecord = {
        id: existingPitch?.id || `pitch_${id}`,
        prospect_id: id,
        top_two_leaks: newPitchContent.top_two_leaks,
        email_subject: newPitchContent.email_subject,
        email_body: newPitchContent.email_body,
        email_word_count: newPitchContent.email_word_count,
        email_followup_day3: newPitchContent.email_followup_day3,
        email_followup_day7: newPitchContent.email_followup_day7,
        email_followup_day14: newPitchContent.email_followup_day14,
        social_dm_body: newPitchContent.social_dm_body,
        social_dm_word_count: newPitchContent.social_dm_word_count,
        social_followup_day3: newPitchContent.social_followup_day3,
        social_followup_day7: newPitchContent.social_followup_day7,
        followup_day3_body: newPitchContent.followup_day3_body,
        generated_with_call_leak: Boolean(missed_call_leaked),
        created_at: existingPitch?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        prospect: updatedDemo,
        pitch: updatedPitch,
      });
    }

    // 2. Update missed call flags & recalculate leak score
    const updatedProspectPayload: Partial<ProspectRecord> = {
      ...prospect,
      missed_call_tested: true,
      missed_call_leaked: Boolean(missed_call_leaked),
    };

    const newLeakScore = calculateLeakScore(updatedProspectPayload);
    updatedProspectPayload.leak_score = newLeakScore;

    // 3. Re-run Pitch Generator prioritizing the Missed Call Bleed
    const mockupUrl = prospect.cloudinary_annotated_mockup_url || '';
    const newPitchContent = generateDeterministicPitch(updatedProspectPayload, mockupUrl);

    // 4. Update Supabase prospect record
    const { data: updatedProspect, error: updateErr } = await supabaseAdmin
      .from('prospects')
      .update({
        missed_call_tested: true,
        missed_call_leaked: Boolean(missed_call_leaked),
        leak_score: newLeakScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 5. Update Supabase pitch record
    const { data: updatedPitch, error: pitchErr } = await supabaseAdmin
      .from('pitches')
      .upsert(
        {
          prospect_id: id,
          top_two_leaks: newPitchContent.top_two_leaks,
          email_subject: newPitchContent.email_subject,
          email_body: newPitchContent.email_body,
          email_word_count: newPitchContent.email_word_count,
          social_dm_body: newPitchContent.social_dm_body,
          social_dm_word_count: newPitchContent.social_dm_word_count,
          followup_day3_body: newPitchContent.followup_day3_body,
          generated_with_call_leak: Boolean(missed_call_leaked),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'prospect_id' }
      )
      .select()
      .single();

    if (pitchErr) throw pitchErr;

    return NextResponse.json({
      success: true,
      prospect: updatedProspect as ProspectRecord,
      pitch: updatedPitch as PitchRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Call test route error:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
