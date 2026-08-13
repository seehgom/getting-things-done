# thnk — a GTD-inspired task tracker

A small Next.js app that reads and manages the `tasks` table in the
Supabase project **thnk**, which you populate by dictating tasks via voice.
The UI organizes those tasks the way David Allen's *Getting Things Done*
describes: capture → clarify → organize → reflect → engage.

- **Inbox** — captured but not yet clarified (no urgency, importance, or
  due date set).
- **Next Actions** — clarified, actionable items grouped by category,
  sorted by importance/urgency and due date.
- **Waiting For** — things you're expecting from someone else.
- **Someday / Maybe** — not committed to right now, reviewed periodically.
- **Weekly Review** (`/review`) — a dedicated page for the book's "reflect"
  step: overdue items, stalled next actions, waiting-for follow-ups, and
  someday/maybe items ready to promote.

Both pages have a **filter bar** for narrowing the visible tasks down to
one category (e.g. just Shopping) and/or one context (e.g. just @Desk) —
selections are stored in the URL (`?category=&context=`) so filtered views
are shareable/bookmarkable.

Each task can also carry a GTD **context** — the tool or location it
requires (`@Desk`, `@Computer`, `@Phone`, `@Errands`, `@Home`, `@Anywhere`,
or anything else you type) — separate from `category`, which is more of an
area of focus (Work/Home/Shopping). Set it from Quick Capture or a task's
Edit form.

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

The app reads/writes the existing `public.tasks` table. Columns used:
`category`, `task`, `notes`, `urgency`, `importance`, `due_date`, `status`,
`context`. GTD buckets (Inbox / Next / Waiting / Someday / Done) are
derived from `status` and whether urgency/importance/due date have been
set — see `lib/gtd.ts`.

`context` (nullable `text`) was added via migration on top of the table
your voice-dictation flow already writes to — existing writes that don't
set it are unaffected and just leave it `null`.
