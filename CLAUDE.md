# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks

## Project Architecture

This is a Korean coffee ordering system built with Next.js 15, React 19, TypeScript, and Supabase for authentication and data storage.

### Key Structure

- **Database Layer**: Supabase integration via `@/lib/supabase/` with client and server configurations
- **Authentication**: Supabase Auth with auth callback routes in `src/app/auth/`
- **Data Models**: TypeScript interfaces defined in `src/types/coffee.ts` including Coffee and DailyOrder types
- **Coffee Data**: Static coffee menu data in `src/data/coffees.ts` with daily order limit configuration
- **UI Framework**: Uses Tailwind CSS v4 and react-hot-toast for notifications
- **Routing**: Next.js App Router with protected dashboard routes

### Environment Setup

Requires Supabase environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### TypeScript Configuration

- Strict mode enabled with unused variables/parameters checking
- Path aliases: `@/*` maps to `./src/*`
- Next.js plugin configured for optimal development

## Planned Improvements

### Automated Daily Reset System
See `DAILY_RESET_IMPROVEMENT.md` for detailed implementation plan:

**Key Features to Implement:**
- Daily statistics generation (orders, users, popular coffee)
- Automated data archiving (7-day retention)
- Predictive inventory management
- Automated daily reports and alerts
- Admin dashboard with trends and analytics

**Database Schema Extensions:**
- `daily_statistics`: Daily aggregated data
- `daily_coffee_stats`: Coffee-specific daily metrics  
- `archived_orders`: Long-term order history

**Automation Schedule:**
- Daily reset job runs at 00:00 via Vercel Cron
- Statistics generation and data archiving
- Email/Slack notifications for alerts

**Implementation Phases:**
1. Database schema and basic statistics (1-2 days)
2. Automation system with Vercel Cron (2-3 days)  
3. Enhanced admin dashboard (3-4 days)
4. Predictive analytics and reporting (5-7 days)