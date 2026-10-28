'use client';

import React from 'react';
import { Flame, Send, Clock, CheckCircle2 } from 'lucide-react';
import { ProspectRecord } from '@/lib/types';

export type FilterType = 'all' | 'hot_burn' | 'ready_to_pitch' | 'followup_due' | 'replied';

interface StatsCardRowProps {
  prospects: ProspectRecord[];
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
}

export function StatsCardRow({ prospects, activeFilter, onSelectFilter }: StatsCardRowProps) {
  const hotBurnCount = prospects.filter((p) => (p.leak_score ?? 0) >= 80).length;
  const readyToPitchCount = prospects.filter((p) => p.outreach_status === 'audited').length;
  const followupDueCount = prospects.filter((p) => p.outreach_status === 'followup_due').length;
  const repliedCount = prospects.filter((p) => p.outreach_status === 'replied').length;

  const cards = [
    {
      id: 'hot_burn' as FilterType,
      title: 'Hot Cash-Burn Leads',
      score: hotBurnCount,
      subtitle: 'Score ≥ 80 • High Ad Spend + Bleed',
      icon: Flame,
      color: '#EF4444',
      badgeClass: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
      activeBorder: 'border-[#EF4444]',
    },
    {
      id: 'ready_to_pitch' as FilterType,
      title: 'Ready to Pitch',
      score: readyToPitchCount,
      subtitle: 'Fresh Audits Awaiting 1-Click Send',
      icon: Send,
      color: '#FFD700',
      badgeClass: 'bg-[#FFD700]/15 text-[#FFD700] border-[#FFD700]/30',
      activeBorder: 'border-[#FFD700]',
    },
    {
      id: 'followup_due' as FilterType,
      title: 'Follow-Ups Due (Day 3+)',
      score: followupDueCount,
      subtitle: '72h Elapsed Without Reply',
      icon: Clock,
      color: '#F59E0B',
      badgeClass: 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30',
      activeBorder: 'border-[#F59E0B]',
      pulse: followupDueCount > 0,
    },
    {
      id: 'replied' as FilterType,
      title: 'Positive Replies',
      score: repliedCount,
      subtitle: 'Active Sales Conversations',
      icon: CheckCircle2,
      color: '#10B981',
      badgeClass: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
      activeBorder: 'border-[#10B981]',
    },
  ];

  return (
    <section
      aria-label="Prospect Decision Metrics"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSelectFilter(isActive ? 'all' : card.id)}
            className={`text-left p-4 rounded-xl bg-[var(--surface-elevated)] border transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700] ${
              isActive
                ? `${card.activeBorder} shadow-lg ring-1 ring-inset ${card.activeBorder}`
                : 'border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--card-hover-bg)]'
            } ${card.pulse && !isActive ? 'border-amber-500/50' : ''}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--text-muted)] font-[family-name:var(--font-body)]">
                {card.title}
              </span>
              <div
                className={`p-2 rounded-lg border flex items-center justify-center ${card.badgeClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="font-[family-name:var(--font-mono)] font-bold text-3xl text-[var(--text-primary)] tracking-tight">
                {card.score}
              </div>
              {isActive && (
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFD700] text-[#0A0A0A]">
                  Active Filter
                </span>
              )}
            </div>

            <p className="text-[11px] text-[var(--text-muted)] mt-2 truncate font-[family-name:var(--font-body)]">
              {card.subtitle}
            </p>
          </button>
        );
      })}
    </section>
  );
}
