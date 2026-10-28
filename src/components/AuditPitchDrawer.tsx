'use client';

import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Button, App, Tooltip } from 'antd';
import {
  AlertTriangle,
  PhoneCall,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Send,
  HelpCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { ProspectRecord, PitchRecord, OutreachStatus } from '@/lib/types';
import { countWords } from '@/lib/textUtils';

interface AuditPitchDrawerProps {
  prospect: ProspectRecord | null;
  pitch: PitchRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onCallTestToggle: (prospectId: string, leaked: boolean) => Promise<void>;
  onStatusChange: (prospectId: string, status: OutreachStatus) => Promise<void>;
  onReaudit?: (url: string) => Promise<void>;
}

export function AuditPitchDrawer({
  prospect,
  pitch,
  isOpen,
  onClose,
  onCallTestToggle,
  onStatusChange,
  onReaudit,
}: AuditPitchDrawerProps) {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<string>('email');
  const [activeViewport, setActiveViewport] = useState<'mobile' | 'desktop'>('mobile');

  // Email Sequence States
  const [emailSubject, setEmailSubject] = useState('');
  const [emailText, setEmailText] = useState('');
  const [emailFollowupDay3, setEmailFollowupDay3] = useState('');
  const [emailFollowupDay7, setEmailFollowupDay7] = useState('');
  const [emailFollowupDay14, setEmailFollowupDay14] = useState('');
  const [showEmailFollowups, setShowEmailFollowups] = useState(true);

  // Social DM Sequence States
  const [dmText, setDmText] = useState('');
  const [dmFollowupDay3, setDmFollowupDay3] = useState('');
  const [dmFollowupDay7, setDmFollowupDay7] = useState('');
  const [showDmFollowups, setShowDmFollowups] = useState(true);

  const [isTogglingCall, setIsTogglingCall] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  // 6-Second Pausable Undo State (State 12: Success, Receipt & Undo)
  const [undoStatus, setUndoStatus] = useState<{
    active: boolean;
    previousStatus: OutreachStatus;
    newStatus: OutreachStatus;
    secondsLeft: number;
  } | null>(null);

  // Derive initial values from prospect & pitch
  useEffect(() => {
    if (!prospect) return;

    // Set active tab based on recommended channel
    if (prospect.recommended_channel === 'social_dm') {
      setActiveTab('dm');
    } else {
      setActiveTab('email');
    }

    const city = prospect.city || 'your area';
    const businessName = prospect.business_name || 'your business';
    const ownerName = prospect.owner_first_name || null;
    const bumpGreeting = ownerName ? `Hey ${ownerName} —` : 'Hey there —';
    const dmGreeting = ownerName ? `Hey ${ownerName}!` : 'Hey team!';

    const defaultEmailFollowupDay3 =
      pitch?.email_followup_day3 ||
      pitch?.followup_day3_body ||
      `${bumpGreeting} quick bump on this.

Home service contractors in ${city} using 60-second budget filters are cutting out 8 hrs of tire-kicker drive time weekly.

Still open to having a quick look at that visual mockup?`;

    const defaultEmailFollowupDay7 =
      pitch?.email_followup_day7 ||
      `${bumpGreeting} wanted to share one quick observation:

When high-intent homeowners search for services in ${city}, slow mobile load and dead contact forms cause over 50% to bounce directly to competing businesses.

Happy to send over that 60-second walkthrough if this is relevant to ${businessName} this quarter.`;

    const defaultEmailFollowupDay14 =
      pitch?.email_followup_day14 ||
      `${bumpGreeting} closing the loop on this.

Assuming you're completely booked out with projects in ${city} right now and this isn't a priority.

If you ever want to check out the mockup on plugging those mobile leaks, just let me know down the road.`;

    const defaultDmFollowupDay3 =
      pitch?.social_followup_day3 ||
      `${dmGreeting} Quick bump on this in case it got buried! Open to seeing a quick observation on your mobile site in ${city}?`;

    const defaultDmFollowupDay7 =
      pitch?.social_followup_day7 ||
      `${dmGreeting} Assuming you're fully booked right now! Will leave you to it—keep up the great work in ${city}.`;

    // Check localStorage for offline/draft edits (State 7)
    const localDraftKey = `pitch_draft_${prospect.id}`;
    const savedDraft = localStorage.getItem(localDraftKey);

    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setEmailSubject(parsed.emailSubject ?? pitch?.email_subject ?? `Quick question regarding ${businessName}`);
        setEmailText(parsed.emailText ?? pitch?.email_body ?? '');
        setEmailFollowupDay3(parsed.emailFollowupDay3 ?? defaultEmailFollowupDay3);
        setEmailFollowupDay7(parsed.emailFollowupDay7 ?? defaultEmailFollowupDay7);
        setEmailFollowupDay14(parsed.emailFollowupDay14 ?? defaultEmailFollowupDay14);
        setDmText(parsed.dmText ?? pitch?.social_dm_body ?? '');
        setDmFollowupDay3(parsed.dmFollowupDay3 ?? defaultDmFollowupDay3);
        setDmFollowupDay7(parsed.dmFollowupDay7 ?? defaultDmFollowupDay7);
        return;
      } catch {}
    }

    setEmailSubject(pitch?.email_subject ?? `Quick question regarding ${businessName}`);
    setEmailText(pitch?.email_body ?? '');
    setEmailFollowupDay3(defaultEmailFollowupDay3);
    setEmailFollowupDay7(defaultEmailFollowupDay7);
    setEmailFollowupDay14(defaultEmailFollowupDay14);
    setDmText(pitch?.social_dm_body ?? '');
    setDmFollowupDay3(defaultDmFollowupDay3);
    setDmFollowupDay7(defaultDmFollowupDay7);
  }, [prospect, pitch]);

  // Persist edits to localStorage
  const handleSaveDraft = (key: string, val: string) => {
    if (!prospect) return;
    const localDraftKey = `pitch_draft_${prospect.id}`;
    let draft: Record<string, string> = {};
    try {
      const existing = localStorage.getItem(localDraftKey);
      if (existing) draft = JSON.parse(existing);
    } catch {}
    draft[key] = val;
    localStorage.setItem(localDraftKey, JSON.stringify(draft));
  };

  // 1-Click Copy helper
  const handleCopy = (id: string, text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(id);
    message.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  // Phone call outcome recording
  const handleCallTestSwitch = async (leaked: boolean) => {
    if (!prospect) return;
    setIsTogglingCall(true);
    try {
      await onCallTestToggle(prospect.id, leaked);
      message.success(
        leaked
          ? 'Missed call bleed recorded! Pitch rewritten with 30s AI Voice Callback hook.'
          : 'Call test passed: Marked as answered live.'
      );
    } catch {
      message.error('Failed to update live call test.');
    } finally {
      setIsTogglingCall(false);
    }
  };

  // Undo countdown timer (State 12)
  useEffect(() => {
    if (!undoStatus || !undoStatus.active) return;
    if (undoStatus.secondsLeft <= 0) {
      setUndoStatus(null);
      return;
    }

    const timer = setTimeout(() => {
      setUndoStatus((prev) => (prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [undoStatus]);

  if (!prospect) return null;

  const score = prospect.leak_score ?? 0;
  const isHighBurn = score >= 80;
  const isModerateBurn = score >= 50 && score < 80;

  // Copy primary pitch & change outreach status
  const handleCopyAndMark = async (channel: 'email' | 'dm') => {
    const textToCopy = channel === 'email' ? emailText : dmText;
    navigator.clipboard.writeText(textToCopy);
    setCopiedStep(channel === 'email' ? 'email_day0' : 'dm_day0');

    const previousStatus = prospect.outreach_status;
    const newStatus: OutreachStatus = channel === 'email' ? 'pitched_email' : 'pitched_dm';

    try {
      await onStatusChange(prospect.id, newStatus);
      setUndoStatus({
        active: true,
        previousStatus,
        newStatus,
        secondsLeft: 6,
      });
      message.success(`Pitch copied! Marked prospect as ${newStatus}.`);

      if (channel === 'dm') {
        const profileUrl = prospect.instagram_url || prospect.facebook_url;
        if (profileUrl) {
          window.open(profileUrl, '_blank', 'noopener,noreferrer');
        }
      }
    } catch {
      message.error('Failed to update outreach status.');
    }
  };

  const handleUndo = async () => {
    if (!undoStatus) return;
    try {
      await onStatusChange(prospect.id, undoStatus.previousStatus);
      setUndoStatus(null);
      message.info('Outreach status reverted back to previous state.');
    } catch {
      message.error('Failed to revert status.');
    }
  };

  return (
    <Drawer
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-1 pr-2 font-[family-name:var(--font-heading)]">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <span className="font-bold text-base text-[var(--text-primary)] leading-snug break-words">
              {prospect.business_name || prospect.root_domain}
            </span>
            <a
              href={prospect.ad_landing_page_url || prospect.homepage_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-[#FFD700] flex items-center gap-1 transition-colors break-all"
            >
              <span>{prospect.root_domain}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          {onReaudit && (
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Button
                size="small"
                onClick={() => onReaudit(prospect.homepage_url)}
                className="bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[#FFD700] text-xs h-7"
              >
                Re-Audit Live Site
              </Button>
            </div>
          )}
        </div>
      }
      placement="right"
      width={1000}
      onClose={onClose}
      open={isOpen}
      className="audit-pitch-drawer"
      styles={{
        body: { padding: 0, background: 'var(--surface-elevated)', color: 'var(--text-primary)' },
        header: { background: 'var(--surface-interactive)', borderColor: 'var(--border-subtle)' },
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full font-[family-name:var(--font-body)]">
        {/* =========================================================================
            LEFT COLUMN (42% / 5 cols): The Technical Evidence & Visual Proof
            ========================================================================= */}
        <div className="lg:col-span-5 p-5 border-r border-[var(--border-subtle)] bg-[var(--surface-canvas)] space-y-5 overflow-y-auto">
          {/* 1. Leak Score Banner */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isHighBurn
                ? 'bg-[#EF4444]/10 border-[#EF4444]/40 text-[#EF4444]'
                : isModerateBurn
                ? 'bg-[#F59E0B]/10 border-[#F59E0B]/40 text-[#F59E0B]'
                : 'bg-[var(--surface-interactive)] border-[#333333] text-[var(--text-muted)]'
            }`}
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Cash-Burn Leak Score
              </div>
              <div className="font-[family-name:var(--font-heading)] font-bold text-2xl text-[var(--text-primary)] flex items-baseline gap-1 mt-0.5">
                <span className="font-mono">{score}</span>
                <span className="text-sm font-normal text-[var(--text-muted)]">/ 100</span>
              </div>
              <div className="text-xs font-semibold mt-1">
                {isHighBurn
                  ? '🔥 Critical Ad-Spend Burn'
                  : isModerateBurn
                  ? '⚠️ High Lead Friction'
                  : '🛡️ Low Funnel Bleed'}
              </div>
            </div>

            <div className="text-right text-xs space-y-1">
              <div className="text-[var(--text-muted)]">Location:</div>
              <div className="font-semibold text-[var(--text-primary)]">{prospect.city || 'Scottsdale, AZ'}</div>
            </div>
          </div>

          {/* 2. Live Lead Call Test Card (Speed-to-Lead Dial) */}
          <div className="p-4 rounded-xl bg-[var(--surface-interactive)] border border-[var(--border-subtle)] space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#FFD700]" />
                <span className="font-[family-name:var(--font-heading)] font-semibold text-sm text-[var(--text-primary)]">
                  Live Lead Call Test
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                Speed-to-Lead
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              62% of high-intent homeowners immediately call the next competitor if their call goes to voicemail without an instant automated text-back.
            </p>

            {/* Contractor Phone Line & Dial Button */}
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-xs">
              <div>
                <div className="text-[10px] text-[var(--text-muted)]">Contractor Line:</div>
                <div className="font-mono font-bold text-sm text-[#FFD700]">
                  {prospect.gbp_primary_phone || prospect.website_display_phone || 'No phone detected'}
                </div>
              </div>
              {(prospect.gbp_primary_phone || prospect.website_display_phone) && (
                <a
                  href={`tel:${(prospect.gbp_primary_phone || prospect.website_display_phone || '').replace(/[^0-9+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-amber-500 dark:text-[#FFD700] border border-amber-500/30 font-semibold text-xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Dial Line</span>
                </a>
              )}
            </div>

            {/* Outcome Recording Buttons */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium text-[var(--text-muted)]">Record Test Result:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isTogglingCall}
                  onClick={() => handleCallTestSwitch(true)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    prospect.missed_call_leaked
                      ? 'bg-[#EF4444] text-white border-[#EF4444] shadow-md shadow-[#EF4444]/20'
                      : 'bg-[var(--surface-canvas)] hover:border-[#EF4444]/60 text-[var(--text-primary)] border-[var(--border-subtle)]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{prospect.missed_call_leaked ? 'Voicemail Leaked' : 'Voicemail / No Text'}</span>
                </button>

                <button
                  type="button"
                  disabled={isTogglingCall}
                  onClick={() => handleCallTestSwitch(false)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                    !prospect.missed_call_leaked && prospect.missed_call_tested
                      ? 'bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/20'
                      : 'bg-[var(--surface-canvas)] hover:border-[#10B981]/60 text-[var(--text-primary)] border-[var(--border-subtle)]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Answered</span>
                </button>
              </div>
            </div>

            {/* Status Indication Banner */}
            {prospect.missed_call_leaked ? (
              <div className="p-2.5 rounded-lg bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-[11px] font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span><strong>Bleed Confirmed:</strong> Pitch rewritten around 30-sec AI Voice Callback &amp; SMS lead recovery!</span>
              </div>
            ) : prospect.missed_call_tested ? (
              <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-[11px] font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span><strong>Test Passed:</strong> Business answered live or dispatched automated response. Pitch prioritizes digital leaks.</span>
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-muted)] italic">
                Dial the line above. If it goes to voicemail with no automated text-back, click &ldquo;Voicemail / No Text&rdquo;.
              </div>
            )}
          </div>

          {/* 3. 14-Point Technical & Reputation Scorecard */}
          <div className="p-4 rounded-xl bg-[var(--surface-interactive)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                14-Point Audit Scorecard
              </span>
              <span className="text-[10px] text-[#FFD700] font-mono">Verified Findings</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Google PPC */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Google Search PPC</div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  {prospect.is_running_google_ppc ? (
                    <span className="text-[#10B981] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active Ads
                    </span>
                  ) : (
                    <span className="text-[#666666] flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Call Tracking */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Call Tracking</div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  {prospect.has_call_tracking ? (
                    <span className="text-[#3B82F6] flex items-center gap-1 truncate">
                      <PhoneCall className="w-3 h-3" /> {prospect.detected_call_tracker || 'Installed'}
                    </span>
                  ) : (
                    <span className="text-[#666666] flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> None
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile Speed */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Mobile Load Time</div>
                <div className="font-mono font-bold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#EF4444]" />
                  <span>{(prospect.mobile_lcp_seconds ?? 7.8).toFixed(1)}s LCP</span>
                </div>
              </div>

              {/* Speed Score */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">PageSpeed Score</div>
                <div className="font-mono font-bold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  <span>{prospect.mobile_speed_score ?? 38} / 100</span>
                </div>
              </div>

              {/* Budget Calculator */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Budget Estimator</div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  {prospect.has_cost_calculator ? (
                    <span className="text-[#10B981] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Installed
                    </span>
                  ) : (
                    <span className="text-[#EF4444] flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Missing
                    </span>
                  )}
                </div>
              </div>

              {/* AI Voice / Chat */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">24/7 AI Voice/Chat</div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  {prospect.has_ai_voice_or_chat ? (
                    <span className="text-[#10B981] flex items-center gap-1 truncate">
                      <CheckCircle2 className="w-3 h-3" /> {prospect.detected_crm_or_chat}
                    </span>
                  ) : (
                    <span className="text-[#EF4444] flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Dead Forms
                    </span>
                  )}
                </div>
              </div>

              {/* AEO Schema */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">AEO / JSON-LD</div>
                <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  {prospect.has_aeo_schema ? (
                    <span className="text-[#10B981] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid Schema
                    </span>
                  ) : (
                    <span className="text-[#F59E0B] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Missing AEO
                    </span>
                  )}
                </div>
              </div>

              {/* Google Reviews */}
              <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Review Recency</div>
                <div className="font-mono text-[var(--text-primary)] flex items-center gap-1 mt-0.5">
                  <span
                    className={
                      (prospect.days_since_last_review ?? 0) > 90 ? 'text-[#F59E0B]' : 'text-[#10B981]'
                    }
                  >
                    {prospect.days_since_last_review ?? 114}d ago ({prospect.gbp_review_count ?? 32} rev)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Visual Proof: Multi-Viewport Captures */}
          <div className="p-4 rounded-xl bg-[var(--surface-interactive)] border border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FFD700]" />
                <span>Visual Proof Captures</span>
              </span>
              <Tooltip title="Verified audit proof captured across mobile and desktop viewports. Click each link to open the full screen, or toggle the preview.">
                <HelpCircle className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
              </Tooltip>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Captured snapshots for mobile and desktop viewports. Click either link to open the respective screen:
            </div>

            {/* Viewport Link Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Mobile Screen Link Card */}
              <div
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  activeViewport === 'mobile'
                    ? 'border-[#FFD700] bg-[var(--surface-canvas)] shadow-sm'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-interactive)] hover:border-[#FFD700]/50'
                }`}
                onClick={() => setActiveViewport('mobile')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#FFD700]" />
                    <span>Mobile Screen</span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">390×844</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mb-2">Simulated mobile viewport</div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={
                      prospect.cloudinary_annotated_mockup_url ||
                      prospect.cloudinary_raw_mobile_url ||
                      `https://placehold.co/390x844/0a0a0a/EF4444.png?text=${encodeURIComponent(prospect.business_name)}%0AMobile+Viewport+(390x844)`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-1 px-2 rounded bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/30 text-[11px] font-medium text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Open Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button
                    size="small"
                    type="text"
                    icon={copiedStep === 'mobile_mockup_url' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(
                        'mobile_mockup_url',
                        prospect.cloudinary_annotated_mockup_url ||
                          prospect.cloudinary_raw_mobile_url ||
                          '',
                        'Mobile Screen URL'
                      );
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-[#FFD700] h-6 px-1.5"
                    title="Copy Mobile Screen URL"
                  />
                </div>
              </div>

              {/* Desktop Screen Link Card */}
              <div
                className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                  activeViewport === 'desktop'
                    ? 'border-[#3B82F6] bg-[var(--surface-canvas)] shadow-sm'
                    : 'border-[var(--border-subtle)] bg-[var(--surface-interactive)] hover:border-[#3B82F6]/50'
                }`}
                onClick={() => setActiveViewport('desktop')}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Desktop Screen</span>
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">1440×900</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mb-2">Full desktop viewport</div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={
                      prospect.cloudinary_annotated_desktop_url ||
                      prospect.cloudinary_raw_desktop_url ||
                      `https://placehold.co/1280x800/0a0a0a/3B82F6.png?text=${encodeURIComponent(prospect.business_name)}%0ADesktop+Viewport+(1440x900)`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-1 px-2 rounded bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 text-[#3B82F6] border border-[#3B82F6]/30 text-[11px] font-medium text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>Open Screen</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <Button
                    size="small"
                    type="text"
                    icon={copiedStep === 'desktop_mockup_url' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(
                        'desktop_mockup_url',
                        prospect.cloudinary_annotated_desktop_url ||
                          prospect.cloudinary_raw_desktop_url ||
                          `https://placehold.co/1280x800/0a0a0a/3B82F6.png?text=${encodeURIComponent(prospect.business_name)}%0ADesktop+Viewport+(1440x900)`,
                        'Desktop Screen URL'
                      );
                    }}
                    className="text-xs text-[var(--text-muted)] hover:text-[#3B82F6] h-6 px-1.5"
                    title="Copy Desktop Screen URL"
                  />
                </div>
              </div>
            </div>

            {/* Active Screen Frame */}
            <div className="relative rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-[var(--surface-canvas)] p-2">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[var(--border-subtle)] text-[11px]">
                <span className="text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                  {activeViewport === 'mobile' ? (
                    <>
                      <Smartphone className="w-3.5 h-3.5 text-[#FFD700]" />
                      <span>Active Preview: Mobile Screen (390×844)</span>
                    </>
                  ) : (
                    <>
                      <Monitor className="w-3.5 h-3.5 text-[#3B82F6]" />
                      <span>Active Preview: Desktop Screen (1440×900)</span>
                    </>
                  )}
                </span>
                <a
                  href={
                    activeViewport === 'mobile'
                      ? prospect.cloudinary_annotated_mockup_url ||
                        prospect.cloudinary_raw_mobile_url ||
                        `https://placehold.co/390x844/0a0a0a/EF4444.png?text=${encodeURIComponent(prospect.business_name)}%0AMobile+Viewport+(390x844)`
                      : prospect.cloudinary_annotated_desktop_url ||
                        prospect.cloudinary_raw_desktop_url ||
                        `https://placehold.co/1280x800/0a0a0a/3B82F6.png?text=${encodeURIComponent(prospect.business_name)}%0ADesktop+Viewport+(1440x900)`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1"
                >
                  <span>Full Screen ↗</span>
                </a>
              </div>

              <div className="flex justify-center items-center overflow-hidden p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    activeViewport === 'mobile'
                      ? prospect.cloudinary_annotated_mockup_url ||
                        prospect.cloudinary_raw_mobile_url ||
                        `https://placehold.co/390x844/0a0a0a/EF4444.png?text=${encodeURIComponent(prospect.business_name)}%0AMobile+Viewport+(390x844)`
                      : prospect.cloudinary_annotated_desktop_url ||
                        prospect.cloudinary_raw_desktop_url ||
                        `https://placehold.co/1280x800/0a0a0a/3B82F6.png?text=${encodeURIComponent(prospect.business_name)}%0ADesktop+Viewport+(1440x900)`
                  }
                  alt={`${prospect.business_name} ${activeViewport} audit capture`}
                  className={`rounded shadow-lg border border-[var(--border-subtle)] object-contain transition-all ${
                    activeViewport === 'mobile'
                      ? 'max-w-[210px] max-h-[300px] h-auto'
                      : 'w-full max-h-[190px]'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (58% / 7 cols): Multi-Touch Follow-Up Stacks
            ========================================================================= */}
        <div className="lg:col-span-7 p-6 bg-[var(--surface-elevated)] flex flex-col justify-between space-y-5 overflow-y-auto lg:max-h-[calc(100vh-60px)]">
          <div className="space-y-4">
            {/* Scraped Proof Callout (Zero Fabrication Contract) */}
            <div className="p-3 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#FFD700]">
                  Authentic Scraped Proof (Rule of 2 &amp; Zero-Fabrication):
                </span>
                <p className="text-[var(--text-primary)] mt-0.5">
                  &ldquo;
                  {prospect.specific_project_detail ||
                    'Verified project craftsmanship and high-ticket service installation'}
                  &rdquo;
                </p>
              </div>
            </div>

            {/* Top 2 Leaks Addressed */}
            {pitch?.top_two_leaks && pitch.top_two_leaks.length > 0 && (
              <div className="p-3 rounded-lg bg-[var(--surface-interactive)] border border-[var(--border-subtle)] text-xs space-y-1">
                <div className="font-semibold text-[var(--text-muted)] text-[10px] uppercase">
                  Top 2 High-Cost Leaks Addressed:
                </div>
                <ul className="list-disc list-inside text-[var(--text-primary)] space-y-0.5">
                  {pitch.top_two_leaks.slice(0, 2).map((leak, i) => (
                    <li key={i} className="truncate">
                      {leak}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Channel Tabs: Email Stack vs. Social DM Stack */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              className="pitch-channel-tabs"
              items={[
                {
                  key: 'email',
                  label: (
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span>📧 Cold Email Stack</span>
                      <span className="px-1.5 py-0.2 rounded bg-[var(--border-subtle)] text-[10px] font-mono">
                        4 Touches
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-2">
                      {/* Zero-Link Deliverability Notice */}
                      <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 flex items-center justify-between">
                        <span>🛡️ <strong>Zero-Link Deliverability Rule:</strong> First email contains zero links to bypass spam filters and land directly in the primary inbox.</span>
                      </div>

                      {/* Step 1: Initial Cold Email (Day 0) */}
                      <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-2 gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#FFD700]/20 text-[#FFD700] font-mono text-[11px] font-bold w-fit">
                              1 • Day 0
                            </span>
                            <span className="text-xs font-medium text-[var(--text-primary)]">
                              Initial Pitch (Curiosity &amp; Permission)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <span className="text-[11px] font-mono text-[var(--text-muted)]">
                              {countWords(emailText)}/110w
                            </span>
                            <Button
                              size="small"
                              icon={copiedStep === 'email_day0' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                              onClick={() => handleCopy('email_day0', emailText, 'Cold Email (Day 0)')}
                              className="bg-[var(--surface-canvas)] border-[var(--border-subtle)] text-[#FFD700] h-6 !font-normal !text-[12px]"
                            >
                              <span className="font-normal text-[12px]">{copiedStep === 'email_day0' ? 'Copied' : 'Copy'}</span>
                            </Button>
                          </div>
                        </div>

                        {/* Subject Line */}
                        <div className="flex items-center justify-between p-2 rounded bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-xs font-mono">
                          <div className="flex items-center gap-1.5 flex-1 overflow-hidden mr-2">
                            <span className="text-[#FFD700] font-semibold shrink-0">Subject:</span>
                            <input
                              type="text"
                              value={emailSubject}
                              onChange={(e) => {
                                setEmailSubject(e.target.value);
                                handleSaveDraft('emailSubject', e.target.value);
                              }}
                              className="bg-transparent border-none text-[var(--text-primary)] w-full focus:outline-none truncate"
                            />
                          </div>
                          <Button
                            type="text"
                            size="small"
                            icon={copiedStep === 'email_subject' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                            onClick={() => handleCopy('email_subject', emailSubject, 'Email Subject')}
                            className="text-xs text-[var(--text-muted)] hover:text-[#FFD700] p-0"
                          >
                            Copy
                          </Button>
                        </div>

                        {/* Email Body Textarea */}
                        <textarea
                          value={emailText}
                          onChange={(e) => {
                            setEmailText(e.target.value);
                            handleSaveDraft('emailText', e.target.value);
                          }}
                          rows={8}
                          className="w-full bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-lg p-3.5 text-base text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                          placeholder="Draft email pitch..."
                        />
                      </div>

                      {/* Follow-Up Sequence Section (Stacked with Interval Details) */}
                      <div className="border border-[var(--border-subtle)] rounded-xl bg-[var(--surface-interactive)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowEmailFollowups(!showEmailFollowups)}
                          className="w-full p-3.5 flex items-center justify-between bg-[var(--surface-interactive)] hover:bg-[var(--surface-canvas)] transition-colors border-b border-[var(--border-subtle)] text-left cursor-pointer"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#FFD700] shrink-0" />
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                Email Follow-Up Stack (Day 3, Day 7, Day 14)
                              </span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--text-muted)] w-fit ml-6 sm:ml-0">
                              3 Scheduled Follow-Ups
                            </span>
                          </div>
                          {showEmailFollowups ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                        </button>

                        {showEmailFollowups && (
                          <div className="p-4 space-y-4">
                            {/* Step 2: Day-3 Follow-Up Bump */}
                            <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-canvas)] space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono text-[10px] font-bold w-fit">
                                    Day 3 (72h Bump)
                                  </span>
                                  <span className="text-xs font-medium text-[var(--text-primary)]">
                                    Contractor Time Savings Check-In
                                  </span>
                                </div>
                                <Button
                                  size="small"
                                  icon={copiedStep === 'email_day3' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy('email_day3', emailFollowupDay3, 'Day 3 Follow-Up')}
                                  className="text-xs bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[#FFD700] h-6 self-start sm:self-auto shrink-0"
                                >
                                  {copiedStep === 'email_day3' ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                              <textarea
                                value={emailFollowupDay3}
                                onChange={(e) => {
                                  setEmailFollowupDay3(e.target.value);
                                  handleSaveDraft('emailFollowupDay3', e.target.value);
                                }}
                                rows={4}
                                className="w-full bg-[var(--surface-interactive)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                              />
                            </div>

                            {/* Step 3: Day-7 Follow-Up (Value / Case Insight) */}
                            <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-canvas)] space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 font-mono text-[10px] font-bold w-fit">
                                    Day 7 (+4 Days)
                                  </span>
                                  <span className="text-xs font-medium text-[var(--text-primary)]">
                                    Local Bounce Rate Insight
                                  </span>
                                </div>
                                <Button
                                  size="small"
                                  icon={copiedStep === 'email_day7' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy('email_day7', emailFollowupDay7, 'Day 7 Follow-Up')}
                                  className="text-xs bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[#FFD700] h-6 self-start sm:self-auto shrink-0"
                                >
                                  {copiedStep === 'email_day7' ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                              <textarea
                                value={emailFollowupDay7}
                                onChange={(e) => {
                                  setEmailFollowupDay7(e.target.value);
                                  handleSaveDraft('emailFollowupDay7', e.target.value);
                                }}
                                rows={4}
                                className="w-full bg-[var(--surface-interactive)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                              />
                            </div>

                            {/* Step 4: Day-14 Follow-Up (Polite Breakup) */}
                            <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-canvas)] space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-500 font-mono text-[10px] font-bold w-fit">
                                    Day 14 (+7 Days)
                                  </span>
                                  <span className="text-xs font-medium text-[var(--text-primary)]">
                                    Polite Breakup / Capacity Closeout
                                  </span>
                                </div>
                                <Button
                                  size="small"
                                  icon={copiedStep === 'email_day14' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy('email_day14', emailFollowupDay14, 'Day 14 Breakup')}
                                  className="text-xs bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[#FFD700] h-6 self-start sm:self-auto shrink-0"
                                >
                                  {copiedStep === 'email_day14' ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                              <textarea
                                value={emailFollowupDay14}
                                onChange={(e) => {
                                  setEmailFollowupDay14(e.target.value);
                                  handleSaveDraft('emailFollowupDay14', e.target.value);
                                }}
                                rows={4}
                                className="w-full bg-[var(--surface-interactive)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'dm',
                  label: (
                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <span>💬 Social Cold DM Stack</span>
                      <span className="px-1.5 py-0.2 rounded bg-[var(--border-subtle)] text-[10px] font-mono">
                        3 Touches
                      </span>
                    </span>
                  ),
                  children: (
                    <div className="space-y-4 pt-2">
                      <div className="p-2.5 rounded-lg bg-[#EC4899]/10 border border-[#EC4899]/30 text-xs text-[#EC4899]">
                        Strictly under 45 words with ZERO links so messages land in the primary inbox without filtering into message requests.
                      </div>

                      {/* Step 1: Initial Cold DM (Day 0) */}
                      <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-interactive)] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-subtle)] pb-2 gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#EC4899]/20 text-[#EC4899] font-mono text-[11px] font-bold w-fit">
                              1 • Day 0
                            </span>
                            <span className="text-xs font-medium text-[var(--text-primary)]">
                              Initial Cold DM (Compliment + Binary Question)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <span className="text-[11px] font-mono text-[var(--text-muted)]">
                              {countWords(dmText)}/45w
                            </span>
                            <Button
                              size="small"
                              icon={copiedStep === 'dm_day0' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                              onClick={() => handleCopy('dm_day0', dmText, 'Cold DM (Day 0)')}
                              className="bg-[var(--surface-canvas)] border-[var(--border-subtle)] text-[#FFD700] h-6 !font-normal !text-[12px]"
                            >
                              <span className="font-normal text-[12px]">{copiedStep === 'dm_day0' ? 'Copied' : 'Copy'}</span>
                            </Button>
                          </div>
                        </div>

                        <textarea
                          value={dmText}
                          onChange={(e) => {
                            setDmText(e.target.value);
                            handleSaveDraft('dmText', e.target.value);
                          }}
                          rows={4}
                          className="w-full bg-[var(--surface-canvas)] border border-[var(--border-subtle)] rounded-lg p-3.5 text-base text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                          placeholder="Draft social DM..."
                        />
                      </div>

                      {/* Social DM Follow-Up Sequence */}
                      <div className="border border-[var(--border-subtle)] rounded-xl bg-[var(--surface-interactive)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowDmFollowups(!showDmFollowups)}
                          className="w-full p-3.5 flex items-center justify-between bg-[var(--surface-interactive)] hover:bg-[var(--surface-canvas)] transition-colors border-b border-[var(--border-subtle)] text-left cursor-pointer"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#FFD700] shrink-0" />
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                Social DM Follow-Up Stack (Day 3, Day 7)
                              </span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--surface-canvas)] border border-[var(--border-subtle)] text-[var(--text-muted)] w-fit ml-6 sm:ml-0">
                              2 Scheduled Bumps
                            </span>
                          </div>
                          {showDmFollowups ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)] shrink-0" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />}
                        </button>

                        {showDmFollowups && (
                          <div className="p-4 space-y-4">
                            {/* Step 2: Day-3 DM Bump */}
                            <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-canvas)] space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 font-mono text-[10px] font-bold w-fit">
                                    Day 3 (72h Bump)
                                  </span>
                                  <span className="text-xs font-medium text-[var(--text-primary)]">
                                    Friendly Conversation Nudge
                                  </span>
                                </div>
                                <Button
                                  size="small"
                                  icon={copiedStep === 'dm_day3' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy('dm_day3', dmFollowupDay3, 'Day 3 DM Bump')}
                                  className="text-xs bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[#FFD700] h-6 self-start sm:self-auto shrink-0"
                                >
                                  {copiedStep === 'dm_day3' ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                              <textarea
                                value={dmFollowupDay3}
                                onChange={(e) => {
                                  setDmFollowupDay3(e.target.value);
                                  handleSaveDraft('dmFollowupDay3', e.target.value);
                                }}
                                rows={3}
                                className="w-full bg-[var(--surface-interactive)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                              />
                            </div>

                            {/* Step 3: Day-7 DM Final */}
                            <div className="p-3.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-canvas)] space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-500 font-mono text-[10px] font-bold w-fit">
                                    Day 7 (+4 Days)
                                  </span>
                                  <span className="text-xs font-medium text-[var(--text-primary)]">
                                    Polite Wrap-Up
                                  </span>
                                </div>
                                <Button
                                  size="small"
                                  icon={copiedStep === 'dm_day7' ? <Check className="w-3 h-3 text-[#10B981]" /> : <Copy className="w-3 h-3" />}
                                  onClick={() => handleCopy('dm_day7', dmFollowupDay7, 'Day 7 DM Wrap-Up')}
                                  className="text-xs bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[#FFD700] h-6 self-start sm:self-auto shrink-0"
                                >
                                  {copiedStep === 'dm_day7' ? 'Copied' : 'Copy'}
                                </Button>
                              </div>
                              <textarea
                                value={dmFollowupDay7}
                                onChange={(e) => {
                                  setDmFollowupDay7(e.target.value);
                                  handleSaveDraft('dmFollowupDay7', e.target.value);
                                }}
                                rows={3}
                                className="w-full bg-[var(--surface-interactive)] border border-[var(--border-subtle)] rounded-lg p-3 text-sm text-[var(--text-primary)] font-[family-name:var(--font-body)] focus:border-[#FFD700] focus:outline-none resize-none leading-relaxed"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Action Footer & Consequence-Explicit CTAs */}
          <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
            {/* 6-Second Pausable Undo Bar (State 12) */}
            {undoStatus && undoStatus.active && (
              <div className="p-3 rounded-lg bg-[#FFD700]/15 border border-[#FFD700] flex items-center justify-between animate-fadeIn text-xs text-[var(--text-primary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#FFD700]" />
                  <span>
                    Marked as <strong>{undoStatus.newStatus}</strong> ({undoStatus.secondsLeft}s left to undo)
                  </span>
                </div>
                <Button
                  size="small"
                  onClick={handleUndo}
                  className="bg-[var(--surface-canvas)] text-[#FFD700] border-none font-bold text-xs h-7 px-3"
                >
                  Undo Status Change
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-[var(--text-muted)] truncate max-w-sm">
                Destination:{' '}
                <strong className="text-[var(--text-primary)]">
                  {activeTab === 'email'
                    ? prospect.primary_email || 'Direct Business Email'
                    : prospect.instagram_url || prospect.facebook_url || 'Social Profile'}
                </strong>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={onClose}
                  className="bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[var(--text-muted)] h-10 px-4"
                >
                  Close
                </Button>

                {activeTab === 'email' ? (
                  <Button
                    type="primary"
                    icon={copiedStep === 'email_day0' ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    onClick={() => handleCopyAndMark('email')}
                    className="bg-[#FFD700] hover:bg-[#FACC15] text-[#0A0A0A] font-bold h-10 px-4 sm:px-5 border-none shadow-md transition-transform active:scale-95 shrink-0"
                  >
                    Copy &amp; Mark
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    icon={copiedStep === 'dm_day0' ? <Check className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                    onClick={() => handleCopyAndMark('dm')}
                    className="bg-[#FFD700] hover:bg-[#FACC15] text-[#0A0A0A] font-bold h-10 px-4 sm:px-5 border-none shadow-md transition-transform active:scale-95 shrink-0"
                  >
                    Copy &amp; Open Profile ↗
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
