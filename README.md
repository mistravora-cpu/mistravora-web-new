# Mistravora — Software Solutions & Digital Products

> Mistravora is a Sri Lankan software company that builds high-performance web platforms, custom dashboards, e-commerce stores, and AI-powered tools for clients in Sri Lanka and worldwide.

**Website:** [https://mistravora.com](https://mistravora.com)
**Email:** hello@mistravora.com
**Phone/WhatsApp:** +94 77 330 6063
**Location:** Paragahadeniya, Kurunegala, Sri Lanka

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Database Architecture](#database-architecture)
5. [Authentication & Security](#authentication--security)
6. [Public Pages](#public-pages)
7. [Admin Dashboard](#admin-dashboard)
8. [API Routes](#api-routes)
9. [SEO & AI Discovery](#seo--ai-discovery)
10. [Media & Cloudflare R2](#media--cloudflare-r2)
11. [Environment Variables](#environment-variables)
12. [Getting Started](#getting-started)
13. [Deployment](#deployment)
14. [Scripts](#scripts)

---

## Overview

Mistravora is a full-stack Next.js application with a Supabase backend. The entire website is dynamic — content is managed through a custom admin dashboard and stored in a normalized PostgreSQL database with Row Level Security (RLS) on every table.

### Key Features

- **Dynamic CMS** — All content (solutions, case studies, blog posts, pricing, testimonials, team, industries, FAQs, policies, hero sections, tech stack, careers, research, resources) is managed through the admin dashboard
- **AI Assistant** — A chat assistant powered by Anthropic Claude (with keyless fallback that answers from Supabase content)
- **3D Hero** — An interactive Three.js robot that tracks the cursor, with lazy-loaded bundle for performance
- **Free Tools** — Cost calculator, ROI calculator, and website audit tool
- **SEO-Optimized** — Sitemap, robots.txt, llms.txt, structured data, canonical URLs, OpenGraph images, breadcrumbs
- **AI-Discoverable** — Machine-readable API endpoints, llms.txt, AI crawler access in robots.txt
- **PWA** — Service worker, offline page, web manifest
- **Security-Hardened** — CSP headers, RLS, admin RBAC, rate limiting, env validation, no source maps in production
- **Performance-First** — Sub-second load times, streaming with Suspense, content-visibility, GPU-accelerated animations
- **Dark/Light Theme** — Full theme support with next-themes
- **Accessibility** — Semantic HTML, ARIA labels, reduced-motion support, keyboard navigation

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, Lucide Icons |
| 3D | Three.js, React Three Fiber, Drei |
| Backend | Supabase (PostgreSQL, Auth, RLS, PostgREST) |
| Validation | Zod 4 |
| Media Storage | Cloudflare R2 (S3-compatible) |
| AI | Anthropic Claude (optional) |
| Email | Resend (optional) |
| Theme | next-themes |
| Deployment | Vercel |

---

## Project Structure

```
Mistravora-web/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public-facing pages (route group)
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── about/
│   │   │   ├── assistant/         # AI chat assistant
│   │   │   ├── blog/              # Blog list + [slug] detail
│   │   │   ├── careers/
│   │   │   ├── case-studies/      # Case studies list + [slug]
│   │   │   ├── contact/
│   │   │   ├── industries/        # Industries list + [slug]
│   │   │   ├── pricing/
│   │   │   ├── research/          # Research list + [slug]
│   │   │   ├── solutions/
│   │   │   └── tools/             # Cost calc, ROI calc, website audit
│   │   ├── admin/                 # Login page
│   │   ├── api/                   # 11 API routes
│   │   ├── dashboard/             # 22 admin dashboard pages
│   │   ├── layout.tsx             # Root layout
│   │   ├── error.tsx              # Error boundary
│   │   ├── loading.tsx            # Loading UI
│   │   ├── not-found.tsx          # Custom 404 page
│   │   ├── opengraph-image.tsx    # Dynamic OG image
│   │   ├── twitter-image.tsx      # Dynamic Twitter card
│   │   ├── robots.ts              # robots.txt generator
│   │   └── sitemap.ts             # sitemap.xml generator
│   ├── components/                # 36 reusable components
│   │   ├── hero/                  # 3D robot hero
│   │   ├── ui/                    # Button, robot hero
│   │   ├── analytics-lazy.tsx     # Consent-gated analytics
│   │   ├── animated-hero.tsx      # Animated hero section
│   │   ├── breadcrumbs.tsx        # Breadcrumb navigation
│   │   ├── chat-widget*.tsx       # Floating chat widget
│   │   ├── clients-marquee.tsx    # Client logo marquee
│   │   ├── faq.tsx                # FAQ accordion
│   │   ├── floating-particles.tsx # Canvas particle effects
│   │   ├── gradient-orbs.tsx      # Interactive gradient orbs
│   │   ├── json-ld.tsx            # Structured data injector
│   │   ├── newsletter-signup.tsx  # Newsletter form
│   │   ├── process.tsx            # 4-step process timeline
│   │   ├── scroll-indicator.tsx   # Animated scroll-down hint
│   │   ├── scroll-progress.tsx    # Reading progress bar
│   │   ├── scroll-reveal.tsx      # IntersectionObserver animations
│   │   ├── section-divider.tsx    # SVG wave divider
│   │   ├── site-footer.tsx        # Footer with social links
│   │   ├── site-header.tsx        # Sticky nav header
│   │   ├── stats-counter.tsx      # Animated number counters
│   │   ├── tech-stack.tsx         # Technology grid
│   │   └── testimonials.tsx       # Dual-row marquee testimonials
│   ├── lib/
│   │   ├── auth.ts                # requireAdmin() helper
│   │   ├── env.ts                 # Zod-validated env vars + serverEnv
│   │   ├── icon-map.ts            # String → Lucide icon mapping
│   │   ├── rate-limit.ts          # In-memory rate limiter
│   │   ├── services.ts            # All Supabase data queries
│   │   ├── site.ts                # Site config, nav, static fallbacks
│   │   ├── social-proof.ts        # Client list fallback
│   │   ├── technologies.ts        # Tech stack categories
│   │   ├── track-event.ts         # Analytics event tracking
│   │   ├── types.ts               # All TypeScript types
│   │   └── utils.ts               # cn() class merge utility
│   ├── proxy.ts                   # Middleware (auth + security headers)
│   └── lib/supabase/
│       ├── client.ts              # Browser Supabase client
│       ├── server.ts              # Server Supabase client (cookies)
│       ├── public.ts              # Cookieless public client (anon key)
│       └── middleware.ts          # Session refresh + RBAC enforcement
├── supabase/
│   └── migrations/                # 39 SQL migration files (0000–0038)
├── public/
│   ├── llms.txt                   # AI-discoverable content
│   ├── sw.js                      # Service worker
│   ├── offline.html               # PWA offline fallback
│   ├── site.webmanifest           # PWA manifest
│   ├── mistravoralogo.svg         # Logo
│   ├── favicon.ico                # Favicon
│   └── android-chrome-*.png       # PWA icons
├── .env.example                   # Environment variable template
├── .gitignore                     # Ignores .env*, .next/, node_modules/
├── next.config.ts                 # Next.js config (CSP, headers, images)
├── package.json
└── tsconfig.json
```

---

## Database Architecture

The database uses **52 normalized tables** — no array columns. Repeating data is stored in child tables with foreign keys and cascade deletes.

### Migration Files

All migrations are in `supabase/migrations/` and are numbered by creation order:

| File | Description |
|---|---|
| `0000_extensions.sql` | pgcrypto extension |
| `0001_admin_users.sql` | Admin users table (FK to auth.users) |
| `0002_settings.sql` | Key-value site settings |
| `0003_functions.sql` | is_admin() + set_updated_at() functions |
| `0004_solutions.sql` | Solutions + 6 child tables (features, technologies, services, process_steps, pricing_packages, package_features) |
| `0005_case_studies.sql` | Case studies + results + technologies |
| `0006_posts.sql` | Blog posts + post_tags |
| `0007_industries.sql` | Industries + challenges + solutions |
| `0008_jobs.sql` | Job positions |
| `0009_benefits.sql` | Career benefits |
| `0010_pricing_tiers.sql` | Pricing tiers + features |
| `0011_pricing_notes.sql` | Pricing notes |
| `0012_pricing_addons.sql` | Pricing add-ons |
| `0013_team_members.sql` | Team members |
| `0014_value_cards.sql` | Home value cards |
| `0015_statistics.sql` | Home statistics |
| `0016_core_values.sql` | About core values |
| `0017_testimonials.sql` | Client testimonials |
| `0018_trusted_companies.sql` | Trusted client companies |
| `0019_tech_stack.sql` | Technology stack |
| `0020_demo_apps.sql` | Demo apps + features + solution_demo_links |
| `0021_policies.sql` | Legal policies (privacy, terms, etc.) |
| `0022_contact_info.sql` | Contact information |
| `0023_social_media.sql` | Social media links |
| `0024_faqs.sql` | FAQs (per-page) |
| `0025_resources.sql` | Downloadable resources |
| `0026_research.sql` | Research articles + tags |
| `0027_inquiries.sql` | Contact form submissions |
| `0028_newsletter_subscribers.sql` | Newsletter signups |
| `0029_media_library.sql` | Media library (R2 uploads) |
| `0030_hero_sections.sql` | Hero sections (per-page) |
| `0031_authors.sql` | Authors (AI discovery) |
| `0032_glossary_terms.sql` | Glossary terms (AI discovery) |
| `0033_knowledge_base.sql` | Knowledge base + tags (AI discovery) |
| `0034_services.sql` | Services + features + technologies + FAQs |
| `0035_seed_settings.sql` | Seed site settings (48 keys) |
| `0036_seed_hero_sections.sql` | Seed hero sections (9 pages) |
| `0037_seed_content.sql` | Seed content (value cards, stats, pricing, industries, etc.) |
| `0038_seed_case_studies.sql` | Seed 7 case studies with results and technologies |

### Normalization Pattern

Array fields were replaced with child tables:

| Parent | Child Tables |
|---|---|
| `solutions` | `solution_features`, `solution_technologies`, `solution_services`, `solution_process_steps`, `solution_pricing_packages`, `solution_pricing_package_features` |
| `case_studies` | `case_study_results`, `case_study_technologies` |
| `posts` | `post_tags` |
| `industries` | `industry_challenges`, `industry_solutions` |
| `pricing_tiers` | `pricing_tier_features` |
| `demo_apps` | `demo_app_features` |
| `research` | `research_tags` |
| `knowledge_base` | `knowledge_base_tags` |
| `services` | `service_features`, `service_technologies`, `service_faqs` |

The service layer (`src/lib/services.ts`) uses nested Supabase selects to merge child records into the array structures expected by React components.

### Supabase Project

- **Project:** `website` (ID: `ghixwjdxzrovdmdzocxj`)
- **Region:** `ap-southeast-2`
- **RLS:** Enabled on all 52 tables
- **Public read:** Filtered by `published = true` / `active = true` / `archived = false`
- **Admin write:** Via `is_admin()` SECURITY DEFINER function with pinned search_path

---

## Authentication & Security

### Authentication Flow

1. User signs in at `/admin` using Supabase Auth (email/password)
2. Middleware (`src/proxy.ts`) refreshes the session on every request
3. Middleware checks `admin_users` table for `/dashboard` access
4. Non-admins are redirected to `/admin` with an error
5. Admins are redirected from `/admin` to `/dashboard`

### Security Measures

| Measure | Implementation |
|---|---|
| **Row Level Security** | Enabled on all 52 tables. Public read policies filter by published/active. Admin write via `is_admin()`. |
| **Admin RBAC** | `admin_users` table with `role` column (`admin` / `super_admin`). Middleware + server actions verify admin status. |
| **SECURITY DEFINER** | `is_admin()` function has pinned `search_path` and revoked EXECUTE from anon/authenticated roles. |
| **CSP** | Strict Content-Security-Policy in `next.config.ts`. No `unsafe-eval`. Whitelisted script/style/img/connect sources. |
| **Security Headers** | X-Content-Type-Options, X-Frame-Options: DENY, HSTS (2yr+preload), Referrer-Policy, Permissions-Policy, COOP, X-Permitted-Cross-Domain-Policies |
| **Rate Limiting** | In-memory sliding window per IP+route. Configured per endpoint (chat: 10/min, newsletter: 5/min, audit: 3/min, contact: 3/min, upload: 10/min, media: 20/min). |
| **Env Validation** | Zod-validated public env vars. `serverEnv` getter object for server-only secrets — throws if missing, never exposed to client. |
| **No Source Maps** | `productionBrowserSourceMaps: false` in next.config.ts |
| **No Service Role Key in App** | All queries use the anon key with RLS. Service role key is not used anywhere in app code. |
| **Table Allowlist** | CRUD server actions have a hardcoded allowlist of 78 tables. Arbitrary table access is blocked. |
| **File Upload Security** | Admin-only, file type/extension validation, 10MB max size, rate-limited, UUID-based filenames |
| **Powered-By Header** | Disabled (`poweredByHeader: false`) |
| **Cookie Security** | Supabase SSR client with httpOnly cookies |

---

## Public Pages

| Route | Description |
|---|---|
| `/` | Home — 3D hero, stats counter, solutions, clients marquee, feature highlights, process timeline, tech stack, testimonials, case studies teaser, CTA, newsletter |
| `/solutions` | All solutions with features, technologies, services, process steps, pricing packages |
| `/industries` | Industry list with challenges and solutions |
| `/industries/[slug]` | Industry detail page |
| `/pricing` | Pricing tiers, features, notes, add-ons, FAQ |
| `/case-studies` | Case study cards with results |
| `/case-studies/[slug]` | Full case study with results, technologies, outcome |
| `/blog` | Blog post list |
| `/blog/[slug]` | Blog post detail |
| `/blog/rss.xml` | RSS feed |
| `/research` | Research article list |
| `/research/[slug]` | Research article detail |
| `/about` | Company story, team, core values, statistics |
| `/careers` | Open positions and benefits |
| `/contact` | Contact form, map, social links |
| `/assistant` | AI chat assistant |
| `/tools` | Free tools overview |
| `/tools/cost-calculator` | Project cost calculator |
| `/tools/roi-calculator` | ROI calculator |
| `/tools/website-audit` | Website audit tool (PageSpeed API) |
| `/policies/[slug]` | Legal policy pages |

---

## Admin Dashboard

The dashboard is at `/dashboard` and requires admin authentication. It provides full CRUD management for all dynamic content.

### Dashboard Pages (22)

| Page | Manages |
|---|---|
| `/dashboard` | Overview |
| `/dashboard/solutions` | Solutions + child tables |
| `/dashboard/case-studies` | Case studies + results + technologies |
| `/dashboard/blog` | Blog posts + tags |
| `/dashboard/industries` | Industries + challenges + solutions |
| `/dashboard/pricing` | Pricing tiers + features, notes, add-ons |
| `/dashboard/testimonials` | Testimonials |
| `/dashboard/trusted-companies` | Trusted companies |
| `/dashboard/tech-stack` | Tech stack entries |
| `/dashboard/hero` | Hero sections (per-page) |
| `/dashboard/about` | Team members, core values, value cards, statistics |
| `/dashboard/careers` | Jobs + benefits |
| `/dashboard/contact` | Contact info + social media |
| `/dashboard/policies` | Legal policies |
| `/dashboard/research` | Research articles + tags |
| `/dashboard/resources` | Downloadable resources |
| `/dashboard/demo-apps` | Demo apps + features |
| `/dashboard/inquiries` | Contact form submissions |
| `/dashboard/newsletter` | Newsletter subscribers |
| `/dashboard/media` | Media library (R2 uploads) |
| `/dashboard/marketing` | Marketing/analytics settings |
| `/dashboard/settings` | Site settings |

### CRUD Architecture

- `src/app/dashboard/crud-actions.ts` — Server actions with admin verification + table allowlist
- `src/app/dashboard/crud-manager.tsx` — Reusable CRUD UI component
- `src/app/dashboard/actions.ts` — Additional dashboard server actions

---

## API Routes

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/services` | GET | Public | JSON list of all published solutions |
| `/api/company` | GET | Public | JSON with company identity, contact, social links |
| `/api/case-studies` | GET | Public | JSON list of all published case studies |
| `/api/industries` | GET | Public | JSON list of all industries with challenges and solutions |
| `/api/contact` | GET | Public | JSON with contact information |
| `/api/faqs` | GET | Public | JSON list of all published FAQs |
| `/api/chat` | POST | Public (rate-limited) | AI chat assistant (Anthropic Claude or keyless mode) |
| `/api/newsletter` | POST | Public (rate-limited) | Newsletter subscription |
| `/api/audit` | POST | Public (rate-limited) | Website audit (Google PageSpeed API) |
| `/api/upload` | POST | Admin only | Upload media to Cloudflare R2 |
| `/api/media` | GET/POST | Admin only | Media library CRUD |

---

## SEO & AI Discovery

### Search Engine Optimization

- **Sitemap:** Dynamic `sitemap.xml` generated from static routes + published DB content (posts, case studies, industries, research, policies)
- **Robots:** `robots.txt` with explicit allow rules for 18+ AI/search crawlers (OAI-SearchBot, GPTBot, ClaudeBot, Googlebot, Bingbot, PerplexityBot, Applebot, CCBot, etc.)
- **Metadata:** Unique title, description, canonical URL, and OpenGraph/Twitter cards on every page
- **Structured Data:** JSON-LD for Organization, LocalBusiness, WebSite, BreadcrumbList, FAQPage, Article, and Service schemas
- **Breadcrumbs:** On all detail pages with BreadcrumbList structured data
- **Dynamic OG Images:** `opengraph-image.tsx` and `twitter-image.tsx` generate images on-the-fly
- **RSS Feed:** `/blog/rss.xml` for blog content syndication

### AI Discovery

- **llms.txt:** Comprehensive AI-readable content file at `/llms.txt` with company identity, services, case studies, pricing, industries, tech stack, API endpoints, and social links
- **AI Crawlers:** Explicitly allowed in robots.txt (OAI-SearchBot, GPTBot, ClaudeBot, Claude-Web, Google-Extended, PerplexityBot, Applebot-Extended, CCBot, Meta-ExternalAgent, Bytespider, etc.)
- **Machine-Readable APIs:** 6 public JSON API endpoints for services, company, case studies, industries, contact, and FAQs
- **Semantic HTML:** Proper heading hierarchy (one H1 per page), semantic landmarks, ARIA labels

---

## Media & Cloudflare R2

Media files are stored in Cloudflare R2 (S3-compatible object storage).

### Upload Flow

1. Admin uploads a file via `/dashboard/media`
2. `POST /api/upload` validates the file (type, extension, size ≤ 10MB)
3. File is uploaded to R2 with a UUID-based key: `uploads/YYYY-MM-DD/{uuid}.{ext}`
4. The R2 public URL is stored in the `media_library` table
5. The URL can be referenced in any content field (hero images, case study covers, team photos, etc.)

### R2 Configuration

Required env vars (see `.env.example`):
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_PUBLIC_URL`
- `R2_BUCKET_NAME`

---

## Environment Variables

All env vars are documented in `.env.example`. Copy it to `.env` and fill in your values.

### Required

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key (public, RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, not used in app code) |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as SUPABASE_URL (exposed to browser) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as SUPABASE_ANON_KEY (exposed to browser) |

### Required for Media Uploads

| Variable | Description |
|---|---|
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key |
| `R2_ENDPOINT` | R2 endpoint URL |
| `R2_PUBLIC_URL` | R2 public URL for serving files |
| `R2_BUCKET_NAME` | R2 bucket name |

### Optional

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | For AI chat assistant (without it, runs in keyless mode) |
| `RESEND_API_KEY` | For email notifications on contact form |
| `PAGESPEED_API_KEY` | For website audit tool |

### Security Notes

- `.env*` is in `.gitignore` — secrets are never committed
- Server-only secrets are accessed via `serverEnv` in `src/lib/env.ts` — they throw if missing and are never exposed to the client bundle
- Public vars (`NEXT_PUBLIC_*`) are validated with Zod at build time
- No `process.env.SECRET` direct access remains in the codebase

---

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 10+
- A Supabase project with the migrations applied
- A Cloudflare R2 bucket (for media uploads)

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd Mistravora-web

# Install dependencies
npm install

# Copy env template and fill in your values
cp .env.example .env
# Edit .env with your Supabase and R2 credentials

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Applying Database Migrations

The migrations in `supabase/migrations/` should be applied to your Supabase project. You can apply them:

1. **Via Supabase MCP** — Use the `apply_migration` tool for each file
2. **Via Supabase Dashboard** — Copy and paste each SQL file into the SQL editor
3. **Via Supabase CLI** — `supabase db push`

### Creating an Admin User

1. Sign up at `/admin` with your email and password
2. Get your user ID from Supabase Dashboard → Auth → Users
3. Run this SQL in the Supabase SQL editor:
   ```sql
   INSERT INTO public.admin_users (id, email, role)
   VALUES ('your-auth-uuid', 'your@email.com', 'super_admin');
   ```
4. Log in at `/admin` — you'll be redirected to `/dashboard`

---

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# Settings → Environment Variables
# Copy all vars from your .env file
```

### Pre-Deploy Checklist

- [ ] TypeScript passes: `npx tsc --noEmit`
- [ ] ESLint passes: `npx eslint .`
- [ ] Build succeeds: `npm run build`
- [ ] All env vars set in Vercel dashboard
- [ ] Supabase migrations applied to production project
- [ ] Admin user created in `admin_users` table
- [ ] Domain pointed to Vercel (`mistravora.com`)
- [ ] `src/lib/site.ts` URL matches your domain

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Type check without emitting |

---

## License

Private — © Mistravora. All rights reserved.
