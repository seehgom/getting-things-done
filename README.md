# thnk — a GTD-inspired task tracker

`main` is the production branch — it's what the deployed app builds from.

A small Next.js app that reads and manages the `tasks` table in the
Supabase project **thnk**, which you populate by dictating tasks via voice.
The UI organizes those tasks the way David Allen's *Getting Things Done*
describes: capture → clarify → organize → reflect → engage.

- **Inbox** — captured but not yet clarified (no urgency, importance, or
  due date set).
- **Next Actions** — clarified, actionable items grouped by category,
  sorted by importance/urgency and due date by default.
- **Waiting For** — things you're expecting from someone else.
- **Someday / Maybe** — not committed to right now, reviewed periodically.

Every one of those four dashboard lists — plus the Active and
Someday/Maybe lists on `/projects` — supports manual priority ordering:
drag an item to move it, or use its ↑ (move up one) and ⤒ (move to top)
buttons. A manually-set position always wins; anything you haven't
touched keeps falling back to its normal default order (priority score
for Next Actions, whatever order it was otherwise in for the rest) until
you drag it. This is the same mechanism Projects already used for
reordering a project's actions — see Data model below.
- **Weekly Review** (`/review`) — a dedicated page for the book's "reflect"
  step: overdue items, stalled next actions, waiting-for follow-ups, and
  someday/maybe items ready to promote.
- **Horizons of Focus** (`/horizons`) — Allen's altitude model above ground
  level: Current Projects (10k ft), Areas of Responsibility (20k ft), Goals
  (30k ft), Vision (40k ft), and Purpose & Values (50k ft). Each altitude
  holds free-text entries you add/edit/archive, stored in their own
  `horizons` table (separate from `tasks`, since these are reviewed
  periodically rather than acted on directly). Ground level (0 ft) isn't
  duplicated here — it's just the Next Actions bucket on the dashboard.
- **History** (`/history`) — where finished work goes. Marking a task Done
  moves it out of the active list into the `completed_tasks` archive (see
  Data model below), so this page is the record of what you actually got
  done. Break it down by preset windows (last week/month/3 months/6
  months/year/all time) and by category and offense/defense.
- **Projects** (`/projects`) — anything that takes more than one task to
  finish. There's no separate projects entity: any task can be promoted
  into one with the "📁 Make project" button, and any other task can then
  be added under it as an action. A promoted task keeps every regular task
  feature (classify, edit, due date, delete, …) and gains one more piece —
  its list of actions. Actions inherit their project's category
  automatically (a Work project's actions are Work too — reparenting or
  changing a project's category cascades to its actions so the hierarchy
  never drifts out of sync), and can be dragged to reorder them by
  priority. One action at a time is flagged **next** (the single thing
  that's doable right now — flagging one unflags any previous next action
  in that project); finishing it automatically promotes whichever action
  is first in that order to take its place, so a project never stalls
  waiting for someone to notice. A project's own bucket isn't taken from
  its own fields — it's derived from its actions: a project with a next
  action flagged is **Active** and shows up in Next Actions on the
  dashboard, one with none flagged reads as **Someday/Maybe**. Completed
  actions don't just disappear — a "Completed" sub-list on the project
  shows them struck through. `/projects` is a focused view grouped by
  Active / Someday-Maybe; projects (and their actions, nested inside the
  project's own card rather than listed separately) still show up on
  Dashboard and Weekly Review like any other task.
- **Voice Notes** (`/voice-notes`) — an index of what Claude's voice chat
  has produced on your behalf when it can't just say the answer out loud:
  a generated doc/PDF uploaded to Drive, a product search's results, a
  link it found. Voice chat writes these directly into the `voice_notes`
  table (see Data model below); this page is where you browse, filter by
  category, mark one reviewed, or add an entry by hand.

Both the Inbox/Next-Actions/Waiting-For/Someday pages have a **filter bar**
for narrowing the visible tasks down to
one category and/or one context — selections are stored in the URL
(`?category=&context=`) so filtered views are shareable/bookmarkable. The
category filter always offers **Work**, **Home**, and **Shopping**
alongside any other categories already in use, so those filters are there
from the start even before a task has been tagged with them.

Each task can also carry a GTD **context** — the tool or location it
requires (`@Desk`, `@Computer`, `@Phone`, `@Errands`, `@Home`, `@Anywhere`,
or anything else you type) — separate from `category`, which is more of an
area of focus (Work/Home/Shopping). Set it from Quick Capture or a task's
Edit form.

Every task in the list also has a **Classify** row for one-click tagging:
**Work / Home / Shopping** for category, and **Offense / Defense** for
whether it's proactively moving something forward (Offense) or keeping an
existing commitment from slipping (Defense). Both are also editable from
Quick Capture and the Edit form.

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

## Testing the UI (Clerk-gated)

Every route except `/sign-in` and `/sign-up` is behind Clerk auth
(`proxy.ts` — this is where Next's `middleware.ts` moved to in this
version). To exercise the UI in Playwright without a human clicking
through a sign-in form each run, [`@clerk/testing`](https://clerk.com/docs/testing/playwright/overview)
drives the real sign-in flow programmatically:

1. Set `E2E_CLERK_USER_EMAIL` in `.env.local` to the email of an existing
   user on this app's Clerk instance (any user works — no password or OTP
   needed; `@clerk/testing` issues a sign-in token for that email via the
   Clerk Backend API using `CLERK_SECRET_KEY`).
2. `npm run test:e2e`

This runs a `setup` project (`e2e/auth.setup.ts`) that signs in once and
saves the session to `playwright/.clerk/user.json` (gitignored), which the
rest of the suite reuses via `storageState` so each spec starts already
authenticated. `e2e/global.setup.ts` fetches a Clerk testing token so
requests bypass bot protection. The dev server is started automatically
(`webServer` in `playwright.config.ts`) unless one is already running on
port 3000.

## Deploying to Vercel

The repo needs no `vercel.json` — it's a standard Next.js app and Vercel
auto-detects the framework, root directory, and build command. When
linking a (new) Vercel project to this repo:

1. Set the **Production Branch** (Project Settings → Git) to `main`.
2. Add all the environment variables listed above (Project Settings →
   Environment Variables), scoped to Production (and Preview, if you want
   preview deployments to work too).
3. Deploy — `npm run build` / `next build` is the build command, no
   overrides needed.

## Data model

The app reads/writes the existing `public.tasks` table. Columns used:
`category`, `task`, `notes`, `urgency`, `importance`, `due_date`, `status`,
`context`, `offense_defense`. GTD buckets (Inbox / Next / Waiting /
Someday / Done) are derived from `status` and whether urgency/importance/
due date have been set — see `lib/gtd.ts`.

`context` and `offense_defense` (both nullable `text`) were added via
migration on top of the table your voice-dictation flow already writes
to — existing writes that don't set them are unaffected and just leave
them `null`.

Marking a task Done doesn't leave it sitting in `tasks` — `completeTask()`
(`app/actions.ts`) moves it into `public.completed_tasks`, a separate
table with the same columns plus `completed_at`, and deletes the row from
`tasks`. This is what keeps the active list from accumulating finished
work and is what `/history` reads from. Any update that sets `status` to
`Done` (the quick "✓ Done" button, or the Edit form's Status field) is
routed through this same path.

The Horizons page reads/writes a separate `public.horizons` table:
`level` (`10k` | `20k` | `30k` | `40k` | `50k`), `title`, `notes`, `status`
(`Active` | `Someday` | `Archived`). See `lib/horizons.ts`.

Projects aren't a separate table — `tasks.is_project` (boolean) marks a
task as a project, and `tasks.parent_task_id` (self-referencing, added via
migration) points an action at the project task it belongs to.
`tasks.is_next_action` flags whether an action is the one thing ready to
do now — `setNextAction()` (`app/actions.ts`) unflags any other action
under the same project first, so only one is ever "the" next action.
`tasks.sort_order` (nullable integer) is the manual drag-and-drop/move-up
order — originally just among a project's actions, now used the same way
for the dashboard's Inbox/Next Actions/Waiting/Someday lists and the
Projects page's Active/Someday-Maybe lists. `reorderTasks()`
(`app/actions.ts`) persists it for whatever list of task ids it's given;
`childrenOf()` (`lib/gtd.ts`) sorts a project's actions by it (falling
back to `created_at` for actions never reordered), and `applyManualOrder()`
does the equivalent for every other reorderable list — a stable sort that
only moves items with an explicit `sort_order`, so anything nobody has
dragged yet keeps the list's normal default order. The drag-and-drop and
move-up/move-to-top UI itself is `lib/useDragReorder.ts` (the shared
drag-state logic) plus `components/SortableList.tsx` (a render-prop
wrapper that hands each `TaskItem` its drag handlers via a `drag` prop,
without SortableList needing to know what else that TaskItem is
rendering). Completing an action that was flagged next
(`completeTask()`) automatically flags whichever sibling is first in that
order, so a project's "next" never goes empty on its own. Creating or
reparenting a task under a project (`createTask()`/`updateTask()`) always
overwrites its `category` with the project's, and a project's own
category change cascades to all of its actions — the whole hierarchy
stays one category.

A project's Active/Someday-Maybe status isn't a stored column —
`projectBucket()` in `lib/gtd.ts` derives it from whether any of the
project's actions has `is_next_action` set; `effectiveBucket()` is what
the dashboard, Weekly Review, and `/projects` actually bucket tasks by
(projects via `projectBucket()`, everything else via `classify()`).
Dashboard and Weekly Review only show top-level tasks and projects in
their Inbox/Next/Waiting/Someday lists — an action (anything with
`parent_task_id` set) shows up nested inside its project's own card
instead of a second time in the flat lists.

Deleting a project cascades to delete its (still-open) actions;
`completed_tasks` mirrors `is_project`/`parent_task_id`/`is_next_action`/
`sort_order` so a project's history survives its actions being archived,
with `parent_task_id` there set null instead of cascading if the project
itself is later deleted.

Voice Notes reads/writes `public.voice_notes` — `description`,
`artifact_type` (doc/pdf/sheet/slides/link/image), `drive_link`,
`category`, `project` (free text), `status` (`Open`/`Done`), `notes`.
This table and its RLS policy already existed (populated by Claude's
voice chat) before this app added a UI for it — see Security below.

## Security

Every table this app touches (`tasks`, `completed_tasks`, `horizons`,
`voice_notes`) has Postgres row-level security enabled with a policy
restricted to Supabase's `authenticated` role — not `anon`, not `public`.
This app itself never uses Supabase's anon/publishable key anywhere; it
only uses the service-role key (`SUPABASE_SERVICE_ROLE_KEY`), read
exclusively in `lib/supabase/server.ts` and never sent to the browser —
all reads/writes happen in Server Components and Server Actions. Every
route except `/sign-in` and `/sign-up`, including `/voice-notes`, is
gated by Clerk through `proxy.ts`'s catch-all matcher, so a signed-out or
disallowed visitor can't reach any of this data through the app.

Net effect: nobody can read or write these tables through Supabase's
public REST API with just the anon key, because RLS requires the
`authenticated` role and this app never issues a Supabase Auth session
(Clerk is the only auth layer) — so that role is unreachable from a
browser here. The one thing outside this repo's visibility is however
Claude's voice chat itself writes into `voice_notes` — that's a
credential configured on the Claude/Anthropic side (most likely also a
service-role key, via whatever connector performs the insert), not
anything stored in this codebase. Worth confirming there that it's kept
server-side and rotating the Supabase service-role key from the Supabase
dashboard if it's ever suspected to have leaked.
