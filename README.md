# thnk — a GTD-inspired task tracker

A small Next.js app that reads and manages the `tasks` table in the
Supabase project **thnk**, which you populate by dictating tasks via voice.
The UI organizes those tasks the way David Allen's *Getting Things Done*
describes: capture → clarify → organize → reflect → engage.

- **Inbox** — captured but not yet clarified (no urgency, importance, or
  due date set).
- **Next Actions** — clarified, actionable items grouped by category
  (used as GTD "context"), sorted by importance/urgency and due date.
- **Waiting For** — things you're expecting from someone else.
- **Someday / Maybe** — not committed to right now, reviewed periodically.
- **Weekly Review** (`/review`) — a dedicated page for the book's "reflect"
  step: overdue items, stalled next actions, waiting-for follow-ups, and
  someday/maybe items ready to promote.

Sign-in is gated by Clerk — only accounts you allow can see or edit your
tasks. Task data is only ever read/written server-side (Server
Components and Server Actions) using the Supabase service role key, which
never reaches the browser.

## Local development

1. Copy `.env.local.example` to `.env.local` and fill in the values (see
   below).
2. `npm install`
3. `npm run dev` and open http://localhost:3000

## Environment variables

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → your app → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → your app → API Keys (keep secret) |
| `SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API (keep secret) |
| `SIGNUPS_DISABLED` | Set to `true` to replace `/sign-up` with Clerk's `<Waitlist />` instead of the sign-up form. Also enable "Waitlist" mode under Clerk Dashboard → User & Authentication → Restrictions so it's enforced by Clerk itself, not just hidden in the UI. |

The same variables need to be set in the Vercel project's Environment
Variables settings for the deployed app to work.

## Data model

The app reads/writes the existing `public.tasks` table as-is — no schema
changes were made, so your voice-dictation flow into Supabase keeps
working unchanged. Columns used: `category`, `task`, `notes`, `urgency`,
`importance`, `due_date`, `status`. GTD buckets (Inbox / Next / Waiting /
Someday / Done) are derived from `status` and whether urgency/importance/
due date have been set — see `lib/gtd.ts`.
