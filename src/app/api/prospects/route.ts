// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — PROSPECTS & PITCHES LIST ROUTE
// GET /api/prospects
// Document References: docs/03-Schema.md & docs/04-TRD.md
// ============================================================================

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ProspectRecord, PitchRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all prospects ordered by leak_score DESC (highest cash burn first)
    const { data: prospectsData, error: prospectsError } = await supabaseAdmin
      .from('prospects')
      .select('*')
      .order('leak_score', { ascending: false });

    if (prospectsError) {
      console.warn('Supabase fetch prospects notice:', prospectsError.message);
      return NextResponse.json({
        success: false,
        prospects: [],
        pitches: {},
        error: prospectsError.message,
        code: prospectsError.code,
      });
    }

    // 2. Fetch associated pitches
    const { data: pitchesData, error: pitchesError } = await supabaseAdmin
      .from('pitches')
      .select('*');

    if (pitchesError) {
      console.warn('Supabase fetch pitches notice:', pitchesError.message);
    }

    const pitchesMap: Record<string, PitchRecord> = {};
    if (pitchesData && Array.isArray(pitchesData)) {
      pitchesData.forEach((pitch: PitchRecord) => {
        if (pitch.prospect_id) {
          pitchesMap[pitch.prospect_id] = pitch;
        }
      });
    }

    return NextResponse.json({
      success: true,
      prospects: (prospectsData as ProspectRecord[]) || [],
      pitches: pitchesMap,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error fetching prospects from Supabase:', message);
    return NextResponse.json(
      { success: false, prospects: [], pitches: {}, error: message },
      { status: 500 }
    );
  }
}
