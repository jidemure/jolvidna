'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { App, Alert } from 'antd';
import { CommandHeader } from '@/components/CommandHeader';
import { StatsCardRow, FilterType } from '@/components/StatsCardRow';
import { ProspectTable } from '@/components/ProspectTable';
import { AuditPitchDrawer } from '@/components/AuditPitchDrawer';
import { ProspectRecord, PitchRecord, OutreachStatus, AuditSingleResponse } from '@/lib/types';
import { calculateLeakScore } from '@/lib/auditEngine';
import { generateDeterministicPitch } from '@/lib/pitchAgent';

// Dynamically import Live UI Vibe Tuner with SSR disabled
const VibeTuner = dynamic(() => import('@/components/VibeTuner'), {
  ssr: false,
});

// Default starter seed data imported from @/lib/seedData (20 prospects across 2 pages)

export default function Home() {
  const { message } = App.useApp();
  const [prospects, setProspects] = useState<ProspectRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dbNotice, setDbNotice] = useState<string | null>(null);
  const [pitches, setPitches] = useState<Record<string, PitchRecord>>({});
  const [activeCardFilter, setActiveCardFilter] = useState<FilterType>('all');

  // Load live prospects & pitches from Supabase
  const loadProspects = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingData(true);
    try {
      const res = await fetch('/api/prospects');
      const data = await res.json();
      if (data.success && Array.isArray(data.prospects)) {
        setProspects(data.prospects);
        if (data.pitches) {
          setPitches(data.pitches);
        }
        setDbNotice(null);
      } else if (data.code === 'PGRST202' || data.error?.includes('schema cache') || data.error?.includes('Could not find')) {
        setDbNotice(
          'Supabase database setup required: Tables (prospects, pitches, radar_campaigns) not found. Please execute supabase/schema.sql in your Supabase SQL Editor.'
        );
      }
    } catch (err) {
      console.warn('Failed to load prospects from Supabase:', err);
    } finally {
      if (!quiet) setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  // Selected prospect for Slide-Over Drawer
  const [selectedProspect, setSelectedProspect] = useState<ProspectRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Determinate 4-step loading state (State 4)
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditProgressMessage, setAuditProgressMessage] = useState('');

  // Top banner for State 10 (Duplicate Domain Cache Hit)
  const [cachedBannerMessage, setCachedBannerMessage] = useState<string | null>(null);

  // Single-URL Sniper Audit Execution
  const handleAuditUrl = async (url: string) => {
    setIsAuditing(true);
    setAuditStep(1);
    setAuditProgressMessage('Capturing 390x844 Mobile DOM & Ad Pixels via ScrapingBee...');
    setCachedBannerMessage(null);

    // Step progression simulation
    const step2Timer = setTimeout(() => {
      setAuditStep(2);
      setAuditProgressMessage('Measuring Mobile LCP & Generating Cloudinary Proof Frame...');
    }, 2200);

    const step3Timer = setTimeout(() => {
      setAuditStep(3);
      setAuditProgressMessage('Running 3-Layer Owner & Social Contact Waterfall...');
    }, 4500);

    const step4Timer = setTimeout(() => {
      setAuditStep(4);
      setAuditProgressMessage('Scoring Revenue Leaks & Drafting Custom Email + IG DM...');
    }, 6800);

    try {
      const res = await fetch('/api/audit/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = (await res.json()) as AuditSingleResponse & { error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Audit failed. Check domain format.');
      }

      // Handle State 10: Duplicate Domain Match (Loaded from Cache)
      if (data.cached) {
        setCachedBannerMessage(
          data.message || 'Loaded existing audit from recent scan (0 credits used).'
        );
      }

      // Update state with newly audited or loaded prospect
      setProspects((prev) => {
        const filtered = prev.filter((p) => p.root_domain !== data.prospect.root_domain);
        return [data.prospect, ...filtered];
      });

      if (data.pitch) {
        setPitches((prev) => ({
          ...prev,
          [data.prospect.id]: data.pitch!,
        }));
      }

      // Automatically open Drawer on completed audit
      setSelectedProspect(data.prospect);
      setIsDrawerOpen(true);
      message.success(`Audit complete for ${data.prospect.business_name}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error(msg);
      throw err;
    } finally {
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      clearTimeout(step4Timer);
      setIsAuditing(false);
      setAuditStep(0);
      setAuditProgressMessage('');
    }
  };

  // Bulk City Radar Launch Execution
  const handleLaunchRadar = async (params: {
    niche: string;
    target_city: string;
    target_timezone: string;
    force_run_now: boolean;
  }) => {
    try {
      const res = await fetch('/api/radar/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = (await res.json()) as {
        success: boolean;
        queued?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to launch city radar.');
      }

      if (data.queued) {
        message.warning(data.message, 8);
      } else {
        message.success(data.message, 6);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error(msg);
    }
  };

  // Live Missed-Call Test Toggle (Right Column)
  const handleCallTestToggle = async (prospectId: string, leaked: boolean) => {
    // 1. Immediate optimistic UI update (<1ms response)
    const target = prospects.find((p) => p.id === prospectId);
    if (target) {
      const updatedTarget: ProspectRecord = {
        ...target,
        missed_call_tested: true,
        missed_call_leaked: leaked,
        leak_score: calculateLeakScore({ ...target, missed_call_tested: true, missed_call_leaked: leaked }),
      };
      setProspects((prev) => prev.map((p) => (p.id === prospectId ? updatedTarget : p)));
      setSelectedProspect(updatedTarget);

      const newPitch = generateDeterministicPitch(
        updatedTarget,
        updatedTarget.cloudinary_annotated_mockup_url || ''
      );
      setPitches((prev) => ({
        ...prev,
        [prospectId]: {
          ...(prev[prospectId] || {
            id: `pitch_${prospectId}`,
            prospect_id: prospectId,
            created_at: new Date().toISOString(),
          }),
          top_two_leaks: newPitch.top_two_leaks,
          email_subject: newPitch.email_subject,
          email_body: newPitch.email_body,
          email_word_count: newPitch.email_word_count,
          email_followup_day3: newPitch.email_followup_day3,
          email_followup_day7: newPitch.email_followup_day7,
          email_followup_day14: newPitch.email_followup_day14,
          social_dm_body: newPitch.social_dm_body,
          social_dm_word_count: newPitch.social_dm_word_count,
          social_followup_day3: newPitch.social_followup_day3,
          social_followup_day7: newPitch.social_followup_day7,
          followup_day3_body: newPitch.followup_day3_body,
          generated_with_call_leak: leaked,
          updated_at: new Date().toISOString(),
        },
      }));
    }

    // 2. Background sync with backend
    try {
      const res = await fetch(`/api/prospects/${prospectId}/call-test`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missed_call_leaked: leaked }),
      });

      if (res.ok) {
        const data = (await res.json()) as {
          success: boolean;
          prospect?: ProspectRecord;
          pitch?: PitchRecord;
          error?: string;
        };
        if (data.prospect) {
          setProspects((prev) => prev.map((p) => (p.id === prospectId ? data.prospect! : p)));
          setSelectedProspect(data.prospect);
        }
        if (data.pitch) {
          setPitches((prev) => ({
            ...prev,
            [prospectId]: data.pitch!,
          }));
        }
      }
    } catch (err: unknown) {
      console.warn('Background call test sync failed, optimistic state preserved:', err);
    }
  };

  // Outreach Status Change
  const handleStatusChange = async (prospectId: string, newStatus: OutreachStatus) => {
    try {
      const res = await fetch(`/api/prospects/${prospectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outreach_status: newStatus }),
      });

      const data = (await res.json()) as {
        success: boolean;
        prospect?: ProspectRecord;
        error?: string;
      };

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update outreach status.');
      }

      if (data.prospect) {
        setProspects((prev) =>
          prev.map((p) =>
            p.id === prospectId
              ? {
                  ...p,
                  outreach_status: newStatus,
                  pitched_at: data.prospect?.pitched_at ?? p.pitched_at,
                }
              : p
          )
        );

        if (selectedProspect && selectedProspect.id === prospectId) {
          setSelectedProspect((prev) =>
            prev ? { ...prev, outreach_status: newStatus, pitched_at: data.prospect?.pitched_at ?? prev.pitched_at } : null
          );
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      message.error(msg);
    }
  };

  // Run Sample Audit on Demo Business
  const handleRunDemoAudit = () => {
    handleAuditUrl('https://premierkitchensaz.com');
  };

  return (
    <div className="min-h-screen bg-[var(--surface-canvas)] text-[var(--text-primary)] font-[family-name:var(--font-body)] antialiased">
      {/* 1. Command Header (Sticky 72px) */}
      <CommandHeader
        onAuditUrl={handleAuditUrl}
        onLaunchRadar={handleLaunchRadar}
        isAuditing={isAuditing}
        auditProgressStep={auditStep}
        auditProgressMessage={auditProgressMessage}
      />

      <main className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 leading-normal space-y-6">
                {/* Supabase Schema Setup Notice */}
        {dbNotice && (
          <div className="mb-4">
            <Alert
              message="Supabase Database Setup Required"
              description={
                <div className="space-y-2 mt-1 text-xs">
                  <p>
                    Your Supabase credentials in <code>.env.local</code> are connected, but the database tables (<code>prospects</code>, <code>pitches</code>, <code>radar_campaigns</code>) have not been created yet.
                  </p>
                  <p className="text-[var(--text-muted)]">
                    Open your <strong>Supabase Dashboard → SQL Editor</strong>, paste the contents of <strong>supabase/schema.sql</strong>, and click <strong>Run</strong>.
                  </p>
                </div>
              }
              type="warning"
              showIcon
              closable
              onClose={() => setDbNotice(null)}
              className="bg-[var(--surface-interactive)] border-amber-500/40 text-[var(--text-primary)]"
            />
          </div>
        )}
        {/* State 10: Duplicate Domain Cached Audit Notice */}
        {cachedBannerMessage && (
          <div className="mb-4">
            <Alert
              message={cachedBannerMessage}
              type="info"
              showIcon
              closable
              onClose={() => setCachedBannerMessage(null)}
              className="bg-[var(--surface-interactive)] border-[#FFD700]/40 text-[var(--text-primary)]"
            />
          </div>
        )}

        {/* 2. KPI Decision Cards Row */}
        <StatsCardRow
          prospects={prospects}
          activeFilter={activeCardFilter}
          onSelectFilter={setActiveCardFilter}
        />

        {/* 3. Master Deduplicated Prospect Work Queue Table */}
        <ProspectTable
          prospects={prospects}
          activeCardFilter={activeCardFilter}
          onClearCardFilter={() => setActiveCardFilter('all')}
          onSelectProspect={(prospect) => {
            setSelectedProspect(prospect);
            setIsDrawerOpen(true);
          }}
          onStatusChange={handleStatusChange}
          onRefreshList={() => { loadProspects(); message.success('Refreshed pipeline from Supabase'); }}
          onRunDemoAudit={handleRunDemoAudit}
          isLoading={isAuditing || isLoadingData}
        />
      </main>

      {/* 4. Slide-Over Audit & Pitch Drawer (980px Split) */}
      <AuditPitchDrawer
        prospect={selectedProspect}
        pitch={selectedProspect ? pitches[selectedProspect.id] ?? null : null}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCallTestToggle={handleCallTestToggle}
        onStatusChange={handleStatusChange}
        onReaudit={handleAuditUrl}
      />

      {/* 5. Live UI Vibe Tuner (Press Alt+S to inspect and fine-tune spacing/fonts/colors) */}
      <VibeTuner />
    </div>
  );
}
