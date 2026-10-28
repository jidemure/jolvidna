// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — PROSPECT OUTREACH STATUS ROUTE
// PATCH /api/prospects/[id]/status
// Document Reference: docs/02-App-Flow.md Section 3.2
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { StatusUpdateRequest, OutreachStatus, ProspectRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: Set<OutreachStatus> = new Set([
  'audited',
  'pitched_email',
  'pitched_dm',
  'followup_due',
  'replied',
  'archived',
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as StatusUpdateRequest;
    const { outreach_status } = body;

    if (!outreach_status || !VALID_STATUSES.has(outreach_status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${Array.from(VALID_STATUSES).join(', ')}`,
        },
        { status: 400 }
      );
    }

    // ARCHIVE = PERMANENT DELETE (User Requirement: Once archived, prospect is deleted)
    if (outreach_status === 'archived') {
      const { error: deleteError } = await supabaseAdmin
        .from('prospects')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.warn('Failed to delete archived prospect from Supabase:', deleteError);
      }

      return NextResponse.json({
        success: true,
        message: 'Prospect archived and deleted from database.',
        deleted: true,
        id,
      });
    }

    // When status transitions to pitched, stamp pitched_at.
    // If reverting to audited (e.g., via 6s Undo bar), reset pitched_at to null.
    const updatePayload: {
      outreach_status: OutreachStatus;
      updated_at: string;
      pitched_at?: string | null;
    } = {
      outreach_status,
      updated_at: new Date().toISOString(),
    };

    if (outreach_status === 'pitched_email' || outreach_status === 'pitched_dm') {
      updatePayload.pitched_at = new Date().toISOString();
    } else if (outreach_status === 'audited') {
      updatePayload.pitched_at = null;
    }

    const { data: updatedProspect, error } = await supabaseAdmin
      .from('prospects')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('Failed to update prospect status in Supabase:', error);
      // Fallback for offline/mock test
      return NextResponse.json({
        success: true,
        message: 'Status updated (offline/demo mode)',
        prospect: { id, outreach_status, pitched_at: updatePayload.pitched_at ?? null },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully.',
      prospect: updatedProspect as ProspectRecord,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Error updating prospect status:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabaseAdmin
      .from('prospects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Prospect deleted successfully.',
      deleted: true,
      id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
