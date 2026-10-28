'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Modal, Select, Input, Button, Progress, Tooltip } from 'antd';
import {
  Radar,
  Search,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Dices,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SUPPORTED_TIMEZONES, isTargetCityInPeakAdHours } from '@/lib/timezoneGuard';
import { GOOGLE_MAPS_NICHES, ALL_US_STATES, pickRandomOpportunity } from '@/lib/nicheData';
import { isBlockedOrDirectory } from '@/lib/auditEngine';
import { useTheme } from '@/context/ThemeContext';

interface CommandHeaderProps {
  onAuditUrl: (url: string) => Promise<void>;
  onLaunchRadar: (params: {
    niche: string;
    target_city: string;
    target_timezone: string;
    force_run_now: boolean;
  }) => Promise<void>;
  isAuditing: boolean;
  auditProgressStep: number; // 0 to 4
  auditProgressMessage: string;
}

export function CommandHeader({
  onAuditUrl,
  onLaunchRadar,
  isAuditing,
  auditProgressStep,
  auditProgressMessage,
}: CommandHeaderProps) {
  const { mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  // Sniper audit state
  const [urlInput, setUrlInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Radar modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState('Kitchen Remodeler');
  const [selectedStateCode, setSelectedStateCode] = useState('AZ');
  const [selectedCity, setSelectedCity] = useState('Scottsdale');
  const [targetTimezone, setTargetTimezone] = useState('America/Phoenix');
  const [forceRunNow, setForceRunNow] = useState(false);
  const [isLaunchingRadar, setIsLaunchingRadar] = useState(false);
  const [randomReason, setRandomReason] = useState<string | null>(null);
  const [isTimezoneBannerCollapsed, setIsTimezoneBannerCollapsed] = useState(false);

  const targetCity = `${selectedCity}, ${selectedStateCode}`;

  // When state changes, populate EVERY city in the state and sync timezone
  const handleStateChange = (stateCode: string) => {
    setSelectedStateCode(stateCode);
    const stateData = ALL_US_STATES[stateCode];
    if (stateData) {
      setTargetTimezone(stateData.timezone);
      if (stateData.cities.length > 0) {
        setSelectedCity(stateData.cities[0]);
      }
    }
  };

  // 1-Click Underserved Market Opportunity Roll
  const handleRandomizeOpportunity = () => {
    const opp = pickRandomOpportunity();
    setSelectedNiche(opp.niche);
    setSelectedStateCode(opp.state);
    setSelectedCity(opp.city);
    setTargetTimezone(opp.timezone);
    setRandomReason(opp.reason);
  };

  // Live timezone preview for selected timezone
  const [mounted, setMounted] = useState(false);
  const [tzPreview, setTzPreview] = useState(() => isTargetCityInPeakAdHours('America/Phoenix'));

  useEffect(() => {
    setMounted(true);
    const updateTz = () => {
      setTzPreview(isTargetCityInPeakAdHours(targetTimezone));
    };
    updateTz();
    const interval = setInterval(updateTz, 30000);
    return () => clearInterval(interval);
  }, [targetTimezone]);

  // Handle Sniper URL submission with <150ms bouncer validation
  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setInputError(null);
    const bouncer = isBlockedOrDirectory(urlInput);

    if (bouncer.isBlocked) {
      setInputError(bouncer.reason || `${bouncer.rootDomain} is a directory or national franchise.`);
      return;
    }

    try {
      await onAuditUrl(urlInput.trim());
      setUrlInput('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setInputError(msg);
    }
  };

  const handleRadarSubmit = async () => {
    setIsLaunchingRadar(true);
    try {
      await onLaunchRadar({
        niche: selectedNiche,
        target_city: targetCity,
        target_timezone: targetTimezone,
        force_run_now: forceRunNow,
      });
      setIsModalOpen(false);
    } finally {
      setIsLaunchingRadar(false);
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-[var(--surface-elevated)] border-b border-[var(--border-subtle)] shadow-md transition-colors px-0">
      <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 lg:py-0 lg:h-[76px] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 lg:gap-4">
        {/* Row 1 on mobile: Logo/Title on left, Radar & Theme toggle on right */}
        <div className="flex items-center justify-between gap-3">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Mobile-only Emblem Badge (Hidden on Desktop) */}
            <div className="relative flex lg:hidden items-center justify-center w-9 h-9 rounded-lg bg-[var(--surface-interactive)] border border-[var(--border-subtle)] p-1 shrink-0 overflow-hidden shadow-sm">
              <Image
                src="/favicon.png"
                alt="Jolvi Emblem"
                width={28}
                height={28}
                className="w-full h-full object-contain"
                priority
              />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD700] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FFD700]" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src={isDark ? '/logo-dark.png' : '/logo-light.png'}
                  alt="Jolvi"
                  width={65}
                  height={24}
                  className="h-5 sm:h-6 w-auto object-contain"
                  priority
                />
                {/* Desktop Version Badge */}
                <span className="hidden lg:inline text-[10px] font-normal leading-[1.3] uppercase px-1.5 py-0 rounded bg-[#FFD700]/10 text-amber-500 dark:text-[#FFD700] border border-amber-500/30 dark:border-[#FFD700]/30 font-mono">
                  V2.0
                </span>
                {/* Mobile Version Badge */}
                <span className="inline lg:hidden text-[10px] font-normal leading-[1.3] uppercase px-1 py-0 rounded bg-[#FFD700]/10 text-amber-500 dark:text-[#FFD700] border border-amber-500/30 dark:border-[#FFD700]/30 font-mono">
                  V2.0
                </span>
              </div>
            </div>
          </div>

          {/* Quick Controls on Mobile */}
          <div className="flex lg:hidden items-center gap-2 shrink-0">
            <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-interactive)] text-[var(--text-primary)] transition-all cursor-pointer"
                aria-label={`Toggle theme: currently ${mode}`}
              >
                {isDark ? <Sun className="w-4 h-4 text-[#FFD700]" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>
            </Tooltip>
            <Button
              type="primary"
              icon={<Radar className="w-3.5 h-3.5" />}
              onClick={() => setIsModalOpen(true)}
              className="bg-[var(--surface-interactive)] border border-[#FFD700]/40 text-amber-500 dark:text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0A0A0A] font-bold h-9 px-3 text-xs"
            >
              Radar
            </Button>
          </div>
        </div>

        {/* Center: Instant Sniper URL Audit Bar */}
        <div className="flex-1 max-w-full lg:max-w-2xl px-0 lg:px-2">
          <form onSubmit={handleAuditSubmit} className="relative flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="instant-sniper-url-input"
                  aria-label="Enter contractor domain"
                  type="url"
                  placeholder="Paste contractor domain (e.g. premierkitchensaz.com)..."
                  value={urlInput}
                  disabled={isAuditing}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  prefix={<Search className="w-4 h-4 text-[var(--text-muted)] mr-1" />}
                  className="bg-[var(--surface-canvas)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] h-10 hover:border-[var(--border-strong)] focus:border-[var(--border-strong)] shadow-none focus:shadow-none text-sm"
                  aria-describedby={inputError ? 'sniper-url-error' : undefined}
                />
              </div>

              <Button
                type="primary"
                htmlType="submit"
                loading={isAuditing}
                disabled={!urlInput.trim() || isAuditing}
                className="bg-[#FFD700] hover:bg-[#FACC15] text-[#0A0A0A] font-bold h-10 px-4 min-w-[150px] shrink-0 border-none transition-transform active:scale-95"
              >
                {isAuditing ? 'Auditing...' : 'Audit Website'}
              </Button>
            </div>

            {/* Bouncer / Validation Error Alert */}
            {inputError && (
              <div
                id="sniper-url-error"
                role="alert"
                className="absolute top-[68px] left-0 right-0 z-50 p-2 rounded bg-[#EF4444]/15 border border-[#EF4444] text-[#EF4444] text-xs flex items-center gap-2 shadow-lg"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{inputError}</span>
              </div>
            )}
          </form>
        </div>

        {/* Right: Timezone Pill, Theme Toggle & City Radar Launch */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Tooltip
            title={`WAT Operator Equivalent: ${tzPreview.watTimeFormatted}. Peak contractor ad budget hours are Mon–Fri 09:00–16:59.`}
          >
            <div
              suppressHydrationWarning
              className="hidden xl:flex items-center gap-2 px-3 py-3 rounded-lg bg-[var(--surface-interactive)] border border-[var(--border-subtle)] text-xs"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFD700]" />
              <div className="text-left font-mono text-[11px]" suppressHydrationWarning>
                <span suppressHydrationWarning className="text-[var(--text-primary)] font-semibold">
                  {mounted ? tzPreview.localTimeFormatted : '12:00 PM'}
                </span>{' '}
                <span className="text-[var(--text-muted)]">({targetCity.split(',')[0]})</span>
              </div>
              <span
                className={`w-2 h-2 rounded-full ${
                  tzPreview.inPeakWindow ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                }`}
              />
            </div>
          </Tooltip>

          {/* Theme Mode Toggle (Dark / Light) */}
          <Tooltip title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-interactive)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
              aria-label={`Toggle theme: currently ${mode}`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#FFD700]" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </Tooltip>

          <Button
            type="default"
            icon={<Globe className="w-4 h-4 text-amber-500 dark:text-[#FFD700]" />}
            onClick={() => setIsModalOpen(true)}
            className="bg-[var(--surface-interactive)] text-[var(--text-primary)] border-[var(--border-subtle)] hover:border-[#FFD700] font-semibold h-10 px-4 transition-all"
          >
            + Launch City Radar
          </Button>
        </div>
      </div>

      {/* Determinate 4-Step Progress Indicator (State 4 Loading >1s & >10s) */}
      {isAuditing && (
        <div className="w-full bg-[var(--surface-interactive)] border-t border-[var(--border-subtle)] px-6 py-2 transition-all animate-fadeIn">
          <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[var(--text-primary)]">
              <Zap className="w-4 h-4 text-[#FFD700] animate-pulse" />
              <span className="font-semibold text-amber-500 dark:text-[#FFD700]">Stage {auditProgressStep}/4:</span>
              <span>{auditProgressMessage || 'Executing audit engine pipeline...'}</span>
            </div>
            <div className="w-48">
              <Progress
                percent={auditProgressStep * 25}
                size="small"
                strokeColor="#FFD700"
                trailColor="var(--border-subtle)"
                showInfo={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Bulk City Radar Configuration */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-[var(--text-primary)] font-[family-name:var(--font-heading)] text-lg">
            <Radar className="w-5 h-5 text-[#FFD700]" />
            <span>Launch Geo-SERP City Radar</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={560}
        className="city-radar-modal"
      >
        <div className="space-y-4 pt-2 font-[family-name:var(--font-body)]">
          <p className="text-xs text-[var(--text-muted)]">
            Hunts independent home service businesses spending money on Google LSA, Search PPC, and ranking on
            organic pages 2–3 in your target market.
          </p>

          {/* Random Opportunity Picker & Underserved Discovery */}
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-[var(--text-primary)] font-medium">
                Explore Underserved High-Ticket Markets ($15k–$100k+ jobs)
              </span>
            </div>
            <Button
              size="small"
              icon={<Dices className="w-3.5 h-3.5 text-amber-500" />}
              onClick={handleRandomizeOpportunity}
              className="border-amber-500/40 text-amber-600 dark:text-[#FFD700] hover:border-amber-500 text-xs h-7"
            >
              Surprise Me
            </Button>
          </div>

          {randomReason && (
            <div className="p-2 rounded bg-[var(--surface-interactive)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] italic">
              💡 {randomReason}
            </div>
          )}

          {/* Niches Selector (Official Google Maps Categories) */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Target Google Maps Categories &amp; Niches ({GOOGLE_MAPS_NICHES.length} High-Ticket Trades)
            </label>
            <Select
              value={selectedNiche}
              onChange={setSelectedNiche}
              className="w-full h-10"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              placeholder="Search Google Maps contractor category..."
              options={GOOGLE_MAPS_NICHES.map((n) => ({
                value: n.value,
                label: `${n.label} • ${n.avgTicket} [${n.cluster}]`,
              }))}
            />
          </div>

          {/* Split Geography: All 50 US States & Every City in Selected State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* State Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Target State ({Object.keys(ALL_US_STATES).length} States + DC)
              </label>
              <Select
                value={selectedStateCode}
                onChange={handleStateChange}
                className="w-full h-10"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                options={Object.values(ALL_US_STATES).map((st) => ({
                  value: st.code,
                  label: `${st.name} (${st.code}) • ${st.cities.length} cities`,
                }))}
              />
            </div>

            {/* City Selector with Every City in the State + Search/Type */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                Target City ({ALL_US_STATES[selectedStateCode]?.cities.length || 0} Cities in {selectedStateCode})
              </label>
              <Select
                value={selectedCity}
                onChange={setSelectedCity}
                className="w-full h-10"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                }
                placeholder="Search or pick any city in state..."
                options={(ALL_US_STATES[selectedStateCode]?.cities || []).map((city) => ({
                  value: city,
                  label: city,
                }))}
              />
            </div>
          </div>

          {/* Target Timezone */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
              Target Local Timezone
            </label>
            <Select
              value={targetTimezone}
              onChange={setTargetTimezone}
              className="w-full h-10"
              options={SUPPORTED_TIMEZONES}
            />
          </div>

          {/* Timezone Guard Evaluation Banner (Collapsible) */}
          <div
            className={`rounded-lg border text-xs overflow-hidden transition-all ${
              tzPreview.inPeakWindow
                ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
            }`}
          >
            {/* Clickable Header for Collapsing/Expanding */}
            <button
              type="button"
              onClick={() => setIsTimezoneBannerCollapsed(!isTimezoneBannerCollapsed)}
              className="w-full p-3 flex items-center justify-between text-left cursor-pointer bg-transparent border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-expanded={!isTimezoneBannerCollapsed}
            >
              <div className="flex items-center gap-2.5">
                {tzPreview.inPeakWindow ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 shrink-0" />
                )}
                <span suppressHydrationWarning className="font-semibold text-sm">
                  {tzPreview.inPeakWindow
                    ? `Peak Ad Hours Active (${mounted ? tzPreview.localTimeFormatted : '12:00 PM'} local)`
                    : `Outside Peak Ad Hours (${mounted ? tzPreview.localTimeFormatted : '12:00 PM'} local)`}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-medium opacity-80">
                <span>{isTimezoneBannerCollapsed ? 'Show details' : 'Collapse'}</span>
                {isTimezoneBannerCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {/* Collapsible Details Body */}
            {!isTimezoneBannerCollapsed && (
              <div className="px-3 pb-3 pt-0 space-y-1.5 border-t border-inherit/20 animate-fadeIn">
                <p className="text-[var(--text-muted)] text-xs pt-1.5 leading-relaxed">
                  {tzPreview.inPeakWindow
                    ? 'Contractors in this market currently have active Google Ads and live office phones.'
                    : 'Contractor daily ad budgets are paused. If launched, this campaign will queue for 09:30 AM local.'}
                </p>
                <div suppressHydrationWarning className="font-mono text-[11px] text-[var(--text-muted)]">
                  Operator Time (Lagos): {mounted ? tzPreview.watTimeFormatted : '08:00 PM'}
                </div>
              </div>
            )}
          </div>

          {/* Force Run Override Checkbox */}
          {!tzPreview.inPeakWindow && (
            <label className="flex items-center gap-2 text-xs text-[#A3A3A3] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={forceRunNow}
                onChange={(e) => setForceRunNow(e.target.checked)}
                className="rounded border-[var(--border-subtle)] text-[#FFD700] focus:ring-[#FFD700]"
              />
              <span className="text-[var(--text-primary)]">
                Force run SERP scan now anyway (bypasses peak ad schedule)
              </span>
            </label>
          )}

          {/* Consequence-explicit action button */}
          <div className="pt-3 flex justify-end gap-2">
            <Button
              onClick={() => setIsModalOpen(false)}
              className="bg-[var(--surface-canvas)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] h-10"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={isLaunchingRadar}
              onClick={handleRadarSubmit}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-[#0A0A0A] font-bold h-10 px-5 border-none"
            >
              {tzPreview.inPeakWindow || forceRunNow
                ? `Launch ${targetCity.split(',')[0]} Radar (Est. 15 Leads)`
                : `Queue ${targetCity.split(',')[0]} Radar for 09:30 AM`}
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
