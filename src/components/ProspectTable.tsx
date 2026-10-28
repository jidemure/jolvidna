'use client';

import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Button, Tooltip, Tag, Dropdown, Popover } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Search,
  Flame,
  AlertTriangle,
  Shield,
  Zap,
  Phone,
  Target,
  Mail,
  Clock,
  RefreshCw,
  Filter,
  XCircle,
  MapPin,
  Globe,
  MoreVertical,
  User,
  ChevronDown,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Archive,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import { InstagramOutlined, FacebookOutlined } from '@ant-design/icons';
import { ProspectRecord, OutreachStatus } from '@/lib/types';
import { FilterType } from './StatsCardRow';

interface ProspectTableProps {
  prospects: ProspectRecord[];
  activeCardFilter: FilterType;
  onClearCardFilter: () => void;
  onSelectProspect: (prospect: ProspectRecord) => void;
  onStatusChange: (id: string, newStatus: OutreachStatus) => Promise<void>;
  onRefreshList?: () => void;
  onRunDemoAudit: () => void;
  isLoading?: boolean;
}

export function ProspectTable({
  prospects,
  activeCardFilter,
  onClearCardFilter,
  onSelectProspect,
  onStatusChange,
  onRefreshList,
  onRunDemoAudit,
  isLoading,
}: ProspectTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<string>('all');

  // Filter prospects based on card filter, tab filter, and search query
  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.business_name?.toLowerCase().includes(q);
        const matchesDomain = p.root_domain?.toLowerCase().includes(q);
        const matchesCity = p.city?.toLowerCase().includes(q);
        if (!matchesName && !matchesDomain && !matchesCity) return false;
      }

      // 2. Card filter
      if (activeCardFilter === 'hot_burn' && (p.leak_score ?? 0) < 80) return false;
      if (activeCardFilter === 'ready_to_pitch' && p.outreach_status !== 'audited') return false;
      if (activeCardFilter === 'followup_due' && p.outreach_status !== 'followup_due') return false;
      if (activeCardFilter === 'replied' && p.outreach_status !== 'replied') return false;

      // 3. Status Tab filter
      if (statusTab !== 'all' && p.outreach_status !== statusTab) return false;

      return true;
    });
  }, [prospects, searchQuery, activeCardFilter, statusTab]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() || activeCardFilter !== 'all' || statusTab !== 'all'
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusTab('all');
    onClearCardFilter();
  };

  const columns: ColumnsType<ProspectRecord> = [
    {
      title: 'Contractor',
      key: 'contractor',
      width: 240,
      className: '!px-3',
      onHeaderCell: () => ({
        style: { paddingLeft: '12px', paddingRight: '12px' },
        className: '!px-3',
      }),
      render: (_, record) => {
        const displayName = record.business_name || 'Home Service Business';
        const isLong = displayName.length > 28;
        const truncated = isLong ? `${displayName.slice(0, 26)}...` : displayName;

        return (
          <div className="flex flex-col items-start gap-1 whitespace-nowrap">
            <Tooltip title={isLong ? displayName : undefined}>
              <div
                className="font-[family-name:var(--font-heading)] font-semibold text-sm text-[var(--text-primary)] hover:text-[#FFD700] transition-colors cursor-pointer whitespace-nowrap"
                onClick={() => onSelectProspect(record)}
              >
                {truncated}
              </div>
            </Tooltip>
            {record.city ? (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] whitespace-nowrap shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#FFD700]/70 shrink-0" />
                <span>{record.city}</span>
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-muted)] opacity-60 whitespace-nowrap shrink-0">
                — Location N/A
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'URL',
      key: 'url',
      width: 65,
      align: 'center',
      render: (_, record) => {
        const hasDomain = Boolean(record.root_domain && record.homepage_url);

        if (!hasDomain) {
          return (
            <Tooltip title="No active website detected">
              <span className="inline-flex items-center justify-center cursor-default">
                <Globe className="w-4 h-4 text-slate-400 dark:text-[#555555]" />
              </span>
            </Tooltip>
          );
        }

        return (
          <Tooltip title={`Visit ${record.root_domain}`}>
            <a
              href={record.homepage_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center p-1.5 rounded hover:bg-[var(--surface-interactive)] text-[#10B981] hover:text-[#059669] dark:hover:text-[#34D399] transition-colors"
              aria-label={`Visit ${record.root_domain}`}
            >
              <Globe className="w-4 h-4" />
            </a>
          </Tooltip>
        );
      },
    },
    {
      title: 'Score',
      key: 'leak_score',
      width: 110,
      sorter: (a, b) => (a.leak_score ?? 0) - (b.leak_score ?? 0),
      defaultSortOrder: 'descend',
      render: (_, record) => {
        const score = record.leak_score ?? 0;
        let iconElement = <Shield className="w-4 h-4 text-[var(--text-muted)]" />;
        let tooltipText = 'Low Burn (< 50)';

        if (score >= 80) {
          iconElement = <Flame className="w-4 h-4 text-[#EF4444]" />;
          tooltipText = 'High Burn (≥ 80)';
        } else if (score >= 50) {
          iconElement = <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />;
          tooltipText = 'Moderate Burn (50–79)';
        }

        return (
          <Tooltip title={tooltipText}>
            <div className="flex items-center gap-1.5 font-[family-name:var(--font-mono)] font-medium text-sm text-[var(--text-primary)] whitespace-nowrap cursor-default">
              <span className="font-medium">{score}</span>
              <span className="text-xs text-[var(--text-muted)] font-normal">/100</span>
              {iconElement}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Money-in-Motion',
      key: 'ad_signals',
      width: 175,
      render: (_, record) => {
        const signals = [];

        if (record.is_running_google_ppc) {
          signals.push(
            <span key="ppc" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 whitespace-nowrap">
              <Target className="w-2.5 h-2.5 shrink-0" />
              <span>Google PPC</span>
            </span>
          );
        }

        if (record.is_running_google_lsa) {
          signals.push(
            <span key="lsa" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#FFD700]/15 text-amber-500 dark:text-[#FFD700] border-amber-500/30 dark:border-[#FFD700]/30 whitespace-nowrap">
              <Zap className="w-2.5 h-2.5 shrink-0" />
              <span>LSA Ads</span>
            </span>
          );
        }

        if (record.has_call_tracking) {
          signals.push(
            <span key="call" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 whitespace-nowrap">
              <Phone className="w-2.5 h-2.5 shrink-0" />
              <span>{record.detected_call_tracker || 'Call Tracking'}</span>
            </span>
          );
        }

        if (record.has_meta_pixel) {
          signals.push(
            <span key="meta" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/30 whitespace-nowrap">
              <FacebookOutlined className="text-[11px] shrink-0" />
              <span>Meta Pixel</span>
            </span>
          );
        }

        if (signals.length === 0) {
          return <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">— None active</span>;
        }

        const firstSignal = signals[0];
        const remainingSignals = signals.slice(1);

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {firstSignal}
            {remainingSignals.length > 0 && (
              <Popover
                trigger="click"
                placement="bottom"
                title={<span className="text-xs font-semibold text-[var(--text-primary)]">Active Ad &amp; Tracking Signals ({signals.length})</span>}
                content={
                  <div className="flex flex-col gap-1.5 p-1 min-w-[150px]">
                    {remainingSignals}
                  </div>
                }
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 text-[11px] font-mono font-medium text-[var(--text-muted)] hover:text-[#FFD700] bg-transparent border-0 p-0 cursor-pointer transition-colors"
                  title="Click to view more signals"
                >
                  <span>+{remainingSignals.length}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
                </button>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      title: 'Top Funnel Bleeds',
      key: 'bleeds',
      width: 185,
      render: (_, record) => {
        const bleeds = [];

        if ((record.mobile_speed_score ?? 50) < 60 || (record.mobile_lcp_seconds ?? 0) > 4) {
          bleeds.push(
            <span key="speed" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 font-mono whitespace-nowrap">
              <Clock className="w-2.5 h-2.5 shrink-0" />
              <span>{(record.mobile_lcp_seconds ?? 7.5).toFixed(1)}s Mobile</span>
            </span>
          );
        }

        if (!record.has_cost_calculator) {
          bleeds.push(
            <span key="nocalc" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 whitespace-nowrap">
              <XCircle className="w-2.5 h-2.5 shrink-0" />
              <span>No Budget Calc</span>
            </span>
          );
        }

        if (!record.has_ai_voice_or_chat) {
          bleeds.push(
            <span key="nochat" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 whitespace-nowrap">
              <XCircle className="w-2.5 h-2.5 shrink-0" />
              <span>No AI Voice</span>
            </span>
          );
        }

        if ((record.days_since_last_review ?? 0) > 90) {
          bleeds.push(
            <span key="stale" className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-mono whitespace-nowrap">
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              <span>{record.days_since_last_review}d Stale Reviews</span>
            </span>
          );
        }

        if (bleeds.length === 0) {
          return <span className="text-xs text-[#10B981] whitespace-nowrap">✓ No Major Bleeds</span>;
        }

        const firstBleed = bleeds[0];
        const remainingBleeds = bleeds.slice(1);

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {firstBleed}
            {remainingBleeds.length > 0 && (
              <Popover
                trigger="click"
                placement="bottom"
                title={<span className="text-xs font-semibold text-[var(--text-primary)]">Detected Funnel Bleeds ({bleeds.length})</span>}
                content={
                  <div className="flex flex-col gap-1.5 p-1 min-w-[160px]">
                    {remainingBleeds}
                  </div>
                }
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 text-[11px] font-mono font-medium text-[var(--text-muted)] hover:text-[#EF4444] bg-transparent border-0 p-0 cursor-pointer transition-colors"
                  title="Click to view more bleeds"
                >
                  <span>+{remainingBleeds.length}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-70 shrink-0" />
                </button>
              </Popover>
            )}
          </div>
        );
      },
    },
    {
      title: 'Owner',
      key: 'owner',
      width: 140,
      render: (_, record) => {
        const ownerName = record.owner_full_name || record.owner_first_name;

        if (!ownerName) {
          return <span className="text-xs text-[var(--text-muted)] opacity-60 whitespace-nowrap">— Unknown</span>;
        }

        return (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-primary)] whitespace-nowrap">
            <User className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
            <span className="font-medium truncate max-w-[120px]" title={ownerName}>
              {ownerName}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Best Channel',
      key: 'channel',
      width: 135,
      render: (_, record) => {
        const isEmail = record.recommended_channel === 'email';

        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-normal px-2 py-1 rounded border whitespace-nowrap ${
              isEmail
                ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                : 'bg-[#EC4899]/10 text-[#EC4899] border-[#EC4899]/30'
            }`}
          >
            {isEmail ? <Mail className="w-3 h-3 shrink-0" /> : <InstagramOutlined className="text-xs shrink-0" />}
            <span>{isEmail ? 'Personal Email' : 'Social DM'}</span>
          </span>
        );
      },
    },
    {
      title: 'Outreach Status',
      key: 'status',
      width: 175,
      render: (_, record) => {
        return (
          <Select
            value={record.outreach_status}
            onChange={(newVal) => onStatusChange(record.id, newVal as OutreachStatus)}
            size="small"
            className="w-full text-xs"
            options={[
              {
                value: 'audited',
                label: (
                  <span className="flex items-center gap-1.5 text-xs">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Ready to Pitch</span>
                  </span>
                ),
              },
              {
                value: 'pitched_email',
                label: (
                  <span className="flex items-center gap-1.5 text-xs">
                    <Mail className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Emailed</span>
                  </span>
                ),
              },
              {
                value: 'pitched_dm',
                label: (
                  <span className="flex items-center gap-1.5 text-xs">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                    <span>DM Sent</span>
                  </span>
                ),
              },
              {
                value: 'followup_due',
                label: (
                  <span className="flex items-center gap-1.5 text-xs">
                    <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Follow-Up Due</span>
                  </span>
                ),
              },
              {
                value: 'replied',
                label: (
                  <span className="flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Replied</span>
                  </span>
                ),
              },
              {
                value: 'archived',
                label: (
                  <span className="flex items-center gap-1.5 text-xs">
                    <Archive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Archived</span>
                  </span>
                ),
              },
            ]}
          />
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 70,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        return (
          <div className="flex items-center justify-center">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'inspect',
                    label: (
                      <span className="flex items-center gap-2 font-medium">
                        <Sparkles className="w-4 h-4 text-[#FFD700]" />
                        <span>Inspect &amp; Pitch</span>
                      </span>
                    ),
                    onClick: () => onSelectProspect(record),
                  },
                  {
                    key: 'reaudit',
                    label: (
                      <span className="flex items-center gap-2">
                        <RotateCw className="w-3.5 h-3.5 text-blue-400" />
                        <span>Re-audit Website</span>
                      </span>
                    ),
                    onClick: () => onSelectProspect(record),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'visit',
                    disabled: !record.homepage_url,
                    label: (
                      <a
                        href={record.homepage_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-inherit"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Visit Contractor Site</span>
                      </a>
                    ),
                  },
                  {
                    key: 'call_prospect',
                    disabled: !record.gbp_primary_phone && !record.website_display_phone,
                    label: (
                      <a
                        href={`tel:${record.gbp_primary_phone || record.website_display_phone || ''}`}
                        className="flex items-center gap-2 text-inherit"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Call Business Line</span>
                      </a>
                    ),
                  },
                  {
                    type: 'divider',
                  },
                  {
                    key: 'archive',
                    danger: true,
                    label: (
                      <span className="flex items-center gap-2">
                        <Archive className="w-3.5 h-3.5" />
                        <span>Archive Prospect</span>
                      </span>
                    ),
                    onClick: () => onStatusChange(record.id, 'archived'),
                  },
                ],
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#FFD700]/40 bg-[#FFD700]/10 hover:bg-[#FFD700]/25 text-[#FFD700] hover:border-[#FFD700] transition-all cursor-pointer shadow-sm"
                aria-label={`Actions for ${record.business_name}`}
                title="Open actions menu"
              >
                <MoreVertical className="w-4 h-4 stroke-[2.5]" />
              </button>
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-xl transition-colors">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-[var(--border-subtle)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search businesses, contractors, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            prefix={<Search className="w-4 h-4 text-[var(--text-muted)] mr-1" />}
            allowClear
            className="bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-[var(--text-primary)] h-9 text-xs"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Only: Dropdown select */}
          <div className="flex sm:hidden items-center gap-2 flex-1">
            <Select
              value={statusTab}
              onChange={(val) => setStatusTab(val)}
              className="w-full text-xs"
              size="middle"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'audited', label: 'Ready to Pitch' },
                { value: 'pitched_email', label: 'Emailed' },
                { value: 'pitched_dm', label: 'DMed' },
                { value: 'followup_due', label: 'Follow-Up Due' },
                { value: 'replied', label: 'Replied' },
              ]}
            />
            {onRefreshList && (
              <Button
                icon={<RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                onClick={onRefreshList}
                className="bg-[var(--surface-interactive)] border-[var(--border-subtle)] hover:border-[#FFD700] text-[var(--text-primary)] h-8 px-3 shrink-0"
              />
            )}
          </div>

          {/* Desktop & Tablet: Horizontal Pill Tabs */}
          <div className="hidden sm:inline-flex rounded-lg bg-[var(--surface-interactive)] p-1 border border-[var(--border-subtle)] text-xs">
            {[
              { id: 'all', label: 'All' },
              { id: 'audited', label: 'Ready' },
              { id: 'pitched_email', label: 'Emailed' },
              { id: 'pitched_dm', label: 'DMed' },
              { id: 'followup_due', label: 'Follow-Up' },
              { id: 'replied', label: 'Replied' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusTab === tab.id
                    ? 'bg-[#FFD700] text-[#0A0A0A] font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {onRefreshList && (
            <div className="hidden sm:block">
              <Button
                icon={<RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
                onClick={onRefreshList}
                className="bg-[var(--surface-interactive)] border-[var(--border-subtle)] hover:border-[#FFD700] text-[var(--text-primary)] h-9 px-3"
              />
            </div>
          )}
        </div>
      </div>

      {/* Active Filter Chips Banner (State 3: Filtered-Empty Recovery) */}
      {hasActiveFilters && (
        <div className="px-4 py-2 bg-[var(--surface-interactive)] border-b border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-500 dark:text-[#FFD700]" />
            <span>Active filters:</span>
            {activeCardFilter !== 'all' && (
              <Tag color="gold" className="text-xs">
                Metric: {activeCardFilter.replace(/_/g, ' ')}
              </Tag>
            )}
            {statusTab !== 'all' && (
              <Tag color="blue" className="text-xs">
                Status: {statusTab}
              </Tag>
            )}
            {searchQuery && (
              <Tag color="cyan" className="text-xs">
                Query: &quot;{searchQuery}&quot;
              </Tag>
            )}
          </div>
          <Button
            type="link"
            size="small"
            onClick={clearAllFilters}
            className="text-amber-500 dark:text-[#FFD700] hover:text-amber-600 dark:hover:text-[#FACC15] p-0 text-xs"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* State 1: First-Use Empty State */}
      {prospects.length === 0 && !isLoading && (
        <div className="py-16 px-6 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] flex items-center justify-center mx-auto shadow-inner">
            <Target className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-[#F5F5F5]">
            No Business Audits in Pipeline Yet
          </h2>
          <p className="text-sm text-[#A3A3A3] font-[family-name:var(--font-body)]">
            Run an <strong>Instant Sniper Audit</strong> above by pasting any contractor URL, or launch
            a <strong>Geo-SERP City Radar</strong> to hunt kitchen &amp; bath contractors spending money on Google Ads.
          </p>
          <div className="pt-2">
            <Button
              type="primary"
              onClick={onRunDemoAudit}
              className="bg-[#FFD700] hover:bg-[#FACC15] text-[#0A0A0A] font-bold h-11 px-6 border-none"
            >
              Run Live Audit on Sample Contractor
            </Button>
          </div>
        </div>
      )}

      {/* State 3: Filtered-Empty Zero-Result State */}
      {prospects.length > 0 && filteredProspects.length === 0 && (
        <div className="py-12 px-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#F59E0B] mx-auto" />
          <h3 className="text-base font-semibold text-[var(--text-primary)]">No matching businesses found</h3>
          <p className="text-xs text-[var(--text-muted)]">
            None of your audited home service businesses match the currently active filters or search terms.
          </p>
          <Button
            onClick={clearAllFilters}
            className="bg-[var(--surface-interactive)] border-[var(--border-subtle)] text-amber-500 dark:text-[#FFD700] hover:border-[#FFD700] text-xs h-8"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Populated Table */}
      {filteredProspects.length > 0 && (
        <div className="relative">


          <div className="overflow-x-auto scrollbar-thin">
            <Table
              dataSource={filteredProspects}
              columns={columns}
              rowKey="id"
              loading={isLoading}
              size="middle"
              scroll={{ x: 1320 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                className: 'px-4 py-3 text-xs',
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Businesses`,
              }}
              className="prospect-dark-table"
            />
          </div>
        </div>
      )}
    </div>
  );
}
