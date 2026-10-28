# ARCHITECTURE.md — Directory Structure & File Ownership Map

**Project Name:** Opportunity Radar & Pitch Engine

```
opportunity-radar/
├── GEMINI.md                           # THIS FILE: Root Agent Constitution
├── docs/
│   ├── 01-PRD.md                       # Product Requirements Document
│   ├── 02-App-Flow.md                  # Application Flow & State Machines
│   ├── 03-Schema.md                    # Supabase PostgreSQL DDL
│   ├── 04-TRD.md                       # Technical & API Contracts
│   ├── 05-Design-Brief.md              # UI/UX Tokens & 12-State Matrix
│   └── 06-Implementation-Plan.md       # Step-by-Step Build Checklist
├── supabase/
│   └── schema.sql                      # Executable SQL from 03-Schema.md
└── src/
    ├── app/
    │   ├── layout.tsx                  # Outfit/DM Sans fonts + Antd Dark/Yellow ConfigProvider
    │   ├── page.tsx                    # Single-screen Opportunity Radar Workspace
    │   └── api/
    │       ├── radar/launch/route.ts   # Stage 0: Timezone Guard + ScrapingBee Geo-SERP
    │       ├── audit/single/route.ts   # Stages 1-3: Parallel Scrape + Cloudinary + LLM Pitch
    │       └── prospects/[id]/
    │           ├── status/route.ts     # Outreach lifecycle state transitions + Undo
    │           └── call-test/route.ts  # Live Missed-Call toggle + instant pitch rewrite
    ├── components/
    │   ├── CommandHeader.tsx           # Instant URL Audit Input + City Radar Modal
    │   ├── StatsCardRow.tsx            # 4 Clickable Decision KPI Cards
    │   ├── ProspectTable.tsx           # Ranked Leak Score Table with non-color badges
    │   └── AuditPitchDrawer.tsx        # 980px 2-Column Scorecard + Pitch Editor Drawer
    └── lib/
        ├── supabase.ts                 # Supabase Service Role client
        ├── auditEngine.ts              # Bouncer, DOM Regex Scanner & Leak Scorer
        ├── visualProof.ts              # ScrapingBee 390x844 capture + Cloudinary banner
        ├── timezoneGuard.ts            # WAT-to-US Target City peak hours validator
        └── pitchAgent.ts               # Structured JSON LLM Pitch Generator
```
