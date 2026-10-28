// ============================================================================
// OPPORTUNITY RADAR & PITCH ENGINE — SINGLE-URL AUDIT ROUTE
// POST /api/audit/single
// Document References: docs/04-TRD.md Section 4.1 & GEMINI.md Hard Locks
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { executeSingleAudit } from '@/lib/auditOrchestrator';
import { isBlockedOrDirectory } from '@/lib/auditEngine';
import { AuditSingleRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AuditSingleRequest;
    const { url, ad_landing_page_url, city, is_running_google_ppc, is_running_google_lsa, force_refresh } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
    }

    // LOCK 1: Pre-flight Directory & Franchise Bouncer (<150ms)
    const bouncer = isBlockedOrDirectory(url);
    if (bouncer.isBlocked) {
      return NextResponse.json(
        {
          success: false,
          error: bouncer.reason || `${bouncer.rootDomain} is a directory or national franchise.`,
        },
        { status: 400 }
      );
    }

    const result = await executeSingleAudit({
      url,
      ad_landing_page_url,
      city,
      is_running_google_ppc,
      is_running_google_lsa,
      force_refresh,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Audit single route error:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
