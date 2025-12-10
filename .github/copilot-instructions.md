<!--
Guidance for AI coding agents working on the EventSignup (SignUpPRO) repo.
Keep this file concise and actionable — focus on patterns, commands, and integration points
that help an agent be productive immediately.
-->

# Copilot Instructions for EventSignup (SignUpPRO)

Purpose: quickly orient an AI coding agent about repository structure, developer workflows,
conventions, and important integration points so changes are safe and consistent.

1. Big picture

- Framework: Next.js 16 with the App Router. Primary UI and routes live under `app/`.
- UI: TypeScript + Tailwind v4 + shadcn/ui primitives. Charts use `recharts` and date utilities use `date-fns`.
- Data flow: lightweight server API routes under `app/api/*/route.ts` implement mock/backend actions. UI components call these routes (fetch/forms) and most business logic lives in `lib/`.

2. Important directories & files (quick map)

- `app/` — App Router pages, layouts, route handlers. Look here first for route behavior.
- `components/` — React components. Files suffixed `-client.tsx` are client components (they include `"use client"`). Shared UI primitives live in `components/ui/`.
- `lib/` — Types, utilities, plan limits (`plan-limits.ts`), mock data, and `lib/actions/` (email, seo, supabase integration helpers).
- `scripts/` — SQL files used to create DB schema; useful when wiring a real database.
- `public/` — Static assets.

3. Conventions and patterns to follow

- App Router & server actions: Prefer server components by default. Any component that manipulates client state or uses hooks must be a client component and follow the `-client.tsx` naming convention used across the repo.
- API routes: Each `app/api/.../route.ts` returns JSON and often contains mock implementations. When replacing mocks with real DB calls, preserve the existing route signatures and response shapes.
- Demo mode: The app includes demo shortcuts (auto-login, pre-populated mock data). Tests and local dev often assume these features are available — keep them intact unless intentionally removing demo behavior.
- Feature gating: Pro-only features are protected by plan checks in `lib/plan-limits.ts`. Use that module for limit logic instead of duplicating checks.
- Styling: Tailwind classes are used site-wide. Use `components/ui/*` for common primitives and `clsx` / `cva` patterns when composing variants.

4. Build, run, and tooling

- Install: `pnpm install` is preferred (repo contains `pnpm-lock.yaml`), but `npm install` works too.
- Dev server: `npm run dev` (or `pnpm dev`). Defaults to `http://localhost:3000`.
- Build: `npm run build` then `npm start` for production preview.
- Lint: `npm run lint` runs ESLint across the project.

5. External integrations & env

- Stripe: Billing endpoints under `app/api/billing/*` expect Stripe keys and webhook secret.
- Email: The repo uses `resend` in `package.json` and `lib/actions/email` for magic link & notifications.
- Auth: `@clerk/nextjs` is listed as a dependency but demo auth is implemented via magic-links; check `app/api/auth/*` and `auth/*` pages.
- Database: SQL scripts in `scripts/` show expected schema. `lib/actions/supabase` suggests Supabase helper code exists — when switching to a real DB, run those migrations and wire connection in env.
- Env vars: See `README.md` for expected names (`DATABASE_URL`, `STRIPE_*`, `EMAIL_API_KEY`, `MAGIC_LINK_SECRET`, `NEXT_PUBLIC_APP_URL`, etc.).

6. Safe change guidelines for AI agents

- Preserve API route shapes and status codes — front-end depends on them.
- When making UI changes, follow the client vs server component rule and keep `-client.tsx` suffix consistency.
- Use `lib/plan-limits.ts` and `lib/types.ts` for business rules and shapes; prefer updating these central modules rather than scattering logic.
- If touching auth or billing flows, document required env changes and migration steps in the PR description.

7. Examples from the codebase

- Client component pattern: `components/dashboard-client.tsx` and `components/new-event-client.tsx` — these include `"use client"` and manage client state.
- API route example: `app/api/events/route.ts` — create/update routes return JSON and are called from dashboard forms.
- Plan gating: `lib/plan-limits.ts` contains checks used by UI components like `upgrade-banner.tsx` to enforce free/pro behavior.

8. What to look for in PRs

- Does the change preserve existing API contracts?
- Are client/server component boundaries preserved? (`use client` placed correctly)
- Are plan-limit checks centralized (use `lib/plan-limits.ts`)?
- Are env variables added to `README.md` and documented in the PR?

9. When in doubt

- Run the dev server and reproduce the scenario locally at `http://localhost:3000`.
- Search for example usage before refactoring: components often demonstrate the expected prop shapes (look in `components/` and `app/dashboard/`).

Please review and tell me if you'd like additional project-specific examples (e.g., a sample small PR that replaces a mock route with a Supabase call).
